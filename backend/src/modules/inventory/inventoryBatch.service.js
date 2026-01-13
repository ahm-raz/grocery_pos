import mongoose from 'mongoose';
import Inventory from '../../models/Inventory.js';
import InventoryTransaction from '../../models/InventoryTransaction.js';

// Add stock to inventory (creates new batch or adds to existing)
const addStockToBatch = async (productId, storeId, batchNumber, quantity, expiryDate, reason, session) => {
  let inventory = await Inventory.findOne({ product: productId, store: storeId }).session(session);

  if (!inventory) {
    // Create new inventory record
    inventory = new Inventory({
      product: productId,
      store: storeId,
      batches: [],
      lowStockThreshold: 10
    });
  }

  // Find existing batch or create new
  const batchIndex = inventory.batches.findIndex(b => b.batchNumber === batchNumber);
  const previousTotalQuantity = inventory.batches.reduce((sum, b) => sum + b.quantity, 0);

  if (batchIndex >= 0) {
    // Update existing batch
    inventory.batches[batchIndex].quantity += quantity;
  } else {
    // Add new batch
    inventory.batches.push({
      batchNumber,
      quantity,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      receivedDate: new Date()
    });
  }

  await inventory.save({ session });

  const newTotalQuantity = inventory.batches.reduce((sum, b) => sum + b.quantity, 0);

  // Create transaction record
  const transaction = new InventoryTransaction({
    product: productId,
    store: storeId,
    changeType: 'IN',
    quantity,
    reason: reason || 'RESTOCK',
    batchNumber,
    previousQuantity: previousTotalQuantity,
    newQuantity: newTotalQuantity
  });
  await transaction.save({ session });

  return inventory;
};

// Remove stock using FIFO (First In First Out - earliest expiry first)
const removeStockFIFO = async (productId, storeId, quantity, reason, session) => {
  const inventory = await Inventory.findOne({ product: productId, store: storeId }).session(session);

  if (!inventory) {
    throw new Error('Inventory record not found');
  }

  const previousTotalQuantity = inventory.batches.reduce((sum, b) => sum + b.quantity, 0);
  let remainingQuantity = quantity;

  // Sort batches by expiry date (earliest first), then by receivedDate
  const sortedBatches = [...inventory.batches].sort((a, b) => {
    if (a.expiryDate && b.expiryDate) {
      return a.expiryDate - b.expiryDate;
    }
    if (a.expiryDate) return -1;
    if (b.expiryDate) return 1;
    return a.receivedDate - b.receivedDate;
  });

  // Deduct from batches in FIFO order
  for (let i = 0; i < sortedBatches.length && remainingQuantity > 0; i++) {
    const batch = sortedBatches[i];
    const batchIndex = inventory.batches.findIndex(b => b.batchNumber === batch.batchNumber);

    if (batch.quantity <= remainingQuantity) {
      // Consume entire batch
      const batchQuantity = batch.quantity;
      inventory.batches[batchIndex].quantity = 0;
      remainingQuantity -= batchQuantity;

      // Create transaction for this batch
      const transaction = new InventoryTransaction({
        product: productId,
        store: storeId,
        changeType: 'OUT',
        quantity: batchQuantity,
        reason: reason || 'SALE',
        batchNumber: batch.batchNumber,
        previousQuantity: previousTotalQuantity - (quantity - remainingQuantity - batchQuantity),
        newQuantity: previousTotalQuantity - (quantity - remainingQuantity)
      });
      await transaction.save({ session });
    } else {
      // Partial batch consumption
      inventory.batches[batchIndex].quantity -= remainingQuantity;

      // Create transaction
      const transaction = new InventoryTransaction({
        product: productId,
        store: storeId,
        changeType: 'OUT',
        quantity: remainingQuantity,
        reason: reason || 'SALE',
        batchNumber: batch.batchNumber,
        previousQuantity: previousTotalQuantity - (quantity - remainingQuantity),
        newQuantity: previousTotalQuantity - quantity
      });
      await transaction.save({ session });

      remainingQuantity = 0;
    }
  }

  if (remainingQuantity > 0) {
    throw new Error(`Insufficient stock. Available: ${previousTotalQuantity}, requested: ${quantity}`);
  }

  // Remove batches with zero quantity
  inventory.batches = inventory.batches.filter(b => b.quantity > 0);
  await inventory.save({ session });

  return inventory;
};

export { addStockToBatch, removeStockFIFO };

