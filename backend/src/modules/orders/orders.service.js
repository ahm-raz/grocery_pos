import mongoose from 'mongoose';
import Cart from '../../models/Cart.js';
import Order from '../../models/Order.js';
import Inventory from '../../models/Inventory.js';
import { removeStockFIFO } from '../inventory/inventoryBatch.service.js';
import { logAudit } from '../audit/audit.service.js';

// Generate transaction ID
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const checkoutCart = async (storeId, userId, paymentInfo, auditContext = {}) => {
  const { payments = [], tax = 0 } = paymentInfo || {};
  
  // Validate payments array
  if (!payments || payments.length === 0) {
    throw new Error('At least one payment method is required');
  }

  // Validate payment methods
  const validMethods = ['CASH', 'CARD', 'E_WALLET'];
  for (const payment of payments) {
    if (!validMethods.includes(payment.method)) {
      throw new Error(`Invalid payment method: ${payment.method}`);
    }
    if (!payment.amount || payment.amount <= 0) {
      throw new Error(`Invalid payment amount for ${payment.method}`);
    }
  }

  // Get cart
  const cart = await Cart.findOne({ store: storeId, user: userId })
    .populate('items.product', 'sku name price');

  if (!cart) {
    throw new Error('Cart not found');
  }

  if (!cart.items || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate totals - INTEGRITY CHECK: Recalculate from cart items
  const recalculatedSubtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
  const calculatedTax = tax || 0;
  const recalculatedTotal = recalculatedSubtotal + calculatedTax;

  // INTEGRITY GUARD: Verify cart subtotal matches calculated subtotal
  const subtotalDifference = Math.abs(cart.subtotal - recalculatedSubtotal);
  if (subtotalDifference > 0.01) { // Allow small floating point differences
    throw new Error(`Cart integrity violation: Subtotal mismatch. Expected: $${recalculatedSubtotal.toFixed(2)}, Got: $${cart.subtotal.toFixed(2)}`);
  }

  const subtotal = recalculatedSubtotal;
  const total = recalculatedTotal;

  // Calculate total payment amount
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // INTEGRITY GUARD: Validate payment amount matches total
  if (amountPaid < total) {
    throw new Error(`Insufficient payment. Total: $${total.toFixed(2)}, Paid: $${amountPaid.toFixed(2)}`);
  }

  // INTEGRITY GUARD: Verify payment totals match
  const paymentTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  if (Math.abs(paymentTotal - amountPaid) > 0.01) {
    throw new Error(`Payment integrity violation: Payment total mismatch`);
  }

  const change = amountPaid - total;

  // Re-validate stock for all items before starting transaction
  for (const item of cart.items) {
    const inventory = await Inventory.findOne({
      product: item.product._id,
      store: storeId
    });

    if (!inventory) {
      throw new Error(`Product ${item.product.sku} not available in inventory`);
    }

    const totalQuantity = inventory.batches.reduce((sum, batch) => sum + batch.quantity, 0);
    if (totalQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${item.product.sku}. Available: ${totalQuantity}, requested: ${item.quantity}`);
    }
  }

  // Start MongoDB transaction for atomic operations
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Re-check cart hasn't been checked out (prevent double checkout)
    const currentCart = await Cart.findOne({ store: storeId, user: userId }).session(session);
    if (!currentCart || !currentCart.items || currentCart.items.length === 0) {
      throw new Error('Cart is empty or has been checked out');
    }

    // Deduct inventory using FIFO batch logic
    for (const item of cart.items) {
      await removeStockFIFO(item.product._id, storeId, item.quantity, 'SALE', session);
    }

    // Create order record
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal
    }));

    const transactionId = generateTransactionId();

    const order = new Order({
      store: storeId,
      user: userId,
      items: orderItems,
      subtotal,
      tax: calculatedTax,
      total,
      payments,
      amountPaid,
      change,
      transactionId,
      status: 'COMPLETED'
    });
    await order.save({ session });

    // Clear cart
    cart.items = [];
    cart.subtotal = 0;
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Populate order before returning
    await order.populate('items.product', 'sku name unitType price');
    await order.populate('store', 'name storeCode address');
    await order.populate('user', 'name');

    // Audit log checkout completion
    logAudit({
      ...auditContext,
      user: userId,
      store: storeId,
      action: 'CHECKOUT_COMPLETE',
      entityType: 'ORDER',
      entityId: order._id.toString(),
      after: {
        orderId: order._id.toString(),
        total: order.total,
        itemsCount: order.items.length,
        transactionId: order.transactionId
      },
      severity: 'MEDIUM'
    });

    // Audit log payment
    logAudit({
      ...auditContext,
      user: userId,
      store: storeId,
      action: 'PAYMENT_RECORDED',
      entityType: 'PAYMENT',
      entityId: order.transactionId,
      after: {
        transactionId: order.transactionId,
        amountPaid: order.amountPaid,
        payments: order.payments,
        change: order.change
      },
      severity: 'MEDIUM'
    });

    return order;
  } catch (error) {
    // Rollback transaction on error
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
};

export { checkoutCart };

