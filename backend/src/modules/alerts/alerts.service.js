import Inventory from '../../models/Inventory.js';
import mongoose from 'mongoose';
import { getLowStockItems } from '../inventory/inventory.service.js';

// Get items nearing expiry (configurable days warning)
const getExpiringItems = async (storeId, daysWarning = 7) => {
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + daysWarning);

  const matchStage = {
    'batches.expiryDate': {
      $lte: warningDate,
      $gte: new Date() // Not expired yet
    }
  };

  if (storeId) {
    matchStage.store = new mongoose.Types.ObjectId(storeId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $unwind: '$batches'
    },
    {
      $match: {
        'batches.expiryDate': {
          $lte: warningDate,
          $gte: new Date()
        },
        'batches.quantity': { $gt: 0 }
      }
    },
    {
      $group: {
        _id: '$_id',
        product: { $first: '$product' },
        store: { $first: '$store' },
        lowStockThreshold: { $first: '$lowStockThreshold' },
        batches: { $push: '$batches' },
        totalQuantity: { $sum: '$batches.quantity' }
      }
    },
    {
      $sort: { 'batches.expiryDate': 1 }
    }
  ];

  const items = await Inventory.aggregate(pipeline);

  // Populate references
  await Inventory.populate(items, [
    { path: 'product', select: 'sku name unitType' },
    { path: 'store', select: 'name storeCode' }
  ]);

  return items;
};

// Get comprehensive alerts (low stock + expiring items)
const getInventoryAlerts = async (storeId, daysWarning = 7) => {
  const [lowStockItems, expiringItems] = await Promise.all([
    getLowStockItems(storeId),
    getExpiringItems(storeId, daysWarning)
  ]);

  return {
    lowStock: lowStockItems,
    expiring: expiringItems,
    summary: {
      lowStockCount: lowStockItems.length,
      expiringCount: expiringItems.length
    }
  };
};

export { getExpiringItems, getInventoryAlerts };

