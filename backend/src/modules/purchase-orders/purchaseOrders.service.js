import mongoose from 'mongoose';
import PurchaseOrder from '../../models/PurchaseOrder.js';
import Inventory from '../../models/Inventory.js';
import { addStockToBatch } from '../inventory/inventoryBatch.service.js';

const createPurchaseOrder = async (storeId, supplierName, items) => {
  const purchaseOrder = new PurchaseOrder({
    store: storeId,
    supplierName,
    items,
    status: 'PENDING'
  });

  await purchaseOrder.save();
  await purchaseOrder.populate('items.product', 'sku name');
  await purchaseOrder.populate('store', 'name storeCode');

  return purchaseOrder;
};

const receivePurchaseOrder = async (poId, storeId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchaseOrder = await PurchaseOrder.findOne({ _id: poId, store: storeId })
      .populate('items.product')
      .session(session);

    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }

    if (purchaseOrder.status !== 'PENDING') {
      throw new Error(`Purchase order is already ${purchaseOrder.status}`);
    }

    // Process each item and add to inventory
    for (const item of purchaseOrder.items) {
      await addStockToBatch(
        item.product._id || item.product,
        storeId,
        item.batchNumber,
        item.quantity,
        item.expectedDeliveryDate,
        'PO_RECEIPT',
        session
      );
    }

    // Mark PO as received
    purchaseOrder.status = 'RECEIVED';
    await purchaseOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    await purchaseOrder.populate('items.product', 'sku name');
    await purchaseOrder.populate('store', 'name storeCode');

    return purchaseOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getPurchaseOrders = async (storeId, status) => {
  const query = {};
  if (storeId) {
    query.store = storeId;
  }
  if (status) {
    query.status = status;
  }

  const purchaseOrders = await PurchaseOrder.find(query)
    .populate('items.product', 'sku name')
    .populate('store', 'name storeCode')
    .sort({ createdAt: -1 });

  return purchaseOrders;
};

const getPurchaseOrderById = async (poId, storeId) => {
  const query = { _id: poId };
  if (storeId) {
    query.store = storeId;
  }

  const purchaseOrder = await PurchaseOrder.findOne(query)
    .populate('items.product', 'sku name')
    .populate('store', 'name storeCode');

  if (!purchaseOrder) {
    throw new Error('Purchase order not found');
  }

  return purchaseOrder;
};

const cancelPurchaseOrder = async (poId, storeId) => {
  const purchaseOrder = await PurchaseOrder.findOne({ _id: poId, store: storeId });

  if (!purchaseOrder) {
    throw new Error('Purchase order not found');
  }

  if (purchaseOrder.status !== 'PENDING') {
    throw new Error(`Cannot cancel purchase order with status ${purchaseOrder.status}`);
  }

  purchaseOrder.status = 'CANCELLED';
  await purchaseOrder.save();

  await purchaseOrder.populate('items.product', 'sku name');
  await purchaseOrder.populate('store', 'name storeCode');

  return purchaseOrder;
};

export { createPurchaseOrder, receivePurchaseOrder, getPurchaseOrders, getPurchaseOrderById, cancelPurchaseOrder };

