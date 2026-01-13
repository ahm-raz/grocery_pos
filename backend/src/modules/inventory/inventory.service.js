import mongoose from 'mongoose';
import Inventory from '../../models/Inventory.js';
import InventoryTransaction from '../../models/InventoryTransaction.js';
import { addStockToBatch, removeStockFIFO } from './inventoryBatch.service.js';

const adjustInventory = async (productId, storeId, changeType, quantity, reason, batchNumber, expiryDate) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (changeType === 'IN') {
      // Add stock - requires batchNumber
      if (!batchNumber) {
        throw new Error('batchNumber is required for stock IN operations');
      }
      await addStockToBatch(productId, storeId, batchNumber, quantity, expiryDate, reason || 'MANUAL', session);
    } else if (changeType === 'OUT') {
      // Remove stock using FIFO
      await removeStockFIFO(productId, storeId, quantity, reason || 'MANUAL', session);
    } else {
      throw new Error('Invalid changeType. Must be IN or OUT');
    }

    await session.commitTransaction();
    session.endSession();

    const inventory = await Inventory.findOne({ product: productId, store: storeId })
      .populate('product', 'sku name unitType')
      .populate('store', 'name storeCode');

    return inventory;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getInventoryHistory = async (productId, storeId) => {
  const query = { product: productId };
  if (storeId) {
    query.store = storeId;
  }

  const transactions = await InventoryTransaction.find(query)
    .populate('product', 'sku name')
    .populate('store', 'name')
    .sort({ createdAt: -1 });

  return transactions;
};

const getLowStockItems = async (storeId) => {
  const matchStage = { $expr: { $lte: [{ $sum: '$batches.quantity' }, '$lowStockThreshold'] } };
  if (storeId) {
    matchStage.store = storeId;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        totalQuantity: { $sum: '$batches.quantity' }
      }
    },
    {
      $match: {
        $expr: { $gt: ['$totalQuantity', 0] }
      }
    },
    {
      $sort: { totalQuantity: 1 }
    }
  ];

  const inventories = await Inventory.aggregate(pipeline);
  
  // Populate references
  await Inventory.populate(inventories, [
    { path: 'product', select: 'sku name unitType' },
    { path: 'store', select: 'name storeCode' }
  ]);

  return inventories.map(inv => ({
    ...inv,
    quantity: inv.totalQuantity
  }));
};

export { adjustInventory, getInventoryHistory, getLowStockItems };

