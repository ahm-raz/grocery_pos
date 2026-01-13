import Order from '../../models/Order.js';
import Inventory from '../../models/Inventory.js';
import InventoryTransaction from '../../models/InventoryTransaction.js';
import Product from '../../models/Product.js';
import mongoose from 'mongoose';

const getSalesSummary = async (startDate, endDate, storeId, limit = 30) => {
  // Default to last 30 days if no dates provided
  if (!startDate && !endDate) {
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    startDate = defaultStartDate.toISOString().split('T')[0];
    endDate = defaultEndDate.toISOString().split('T')[0];
  }

  // Build match stage for date range and store
  const matchStage = { status: 'COMPLETED' };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end date
      matchStage.createdAt.$lte = end;
    }
  }
  
  if (storeId) {
    matchStage.store = new mongoose.Types.ObjectId(storeId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        totalRevenue: { $sum: '$total' },
        totalSubtotal: { $sum: '$subtotal' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalRevenue: { $round: ['$totalRevenue', 2] },
        totalSubtotal: { $round: ['$totalSubtotal', 2] },
        orderCount: 1
      }
    }
  ];

  const dailySales = await Order.aggregate(pipeline);

  // Calculate totals
  const totals = dailySales.reduce((acc, day) => {
    acc.totalRevenue += day.totalRevenue;
    acc.totalSubtotal += day.totalSubtotal;
    acc.totalOrders += day.orderCount;
    return acc;
  }, { totalRevenue: 0, totalSubtotal: 0, totalOrders: 0 });

  return {
    dailySales: dailySales.reverse(), // Reverse for chronological order
    summary: {
      totalRevenue: Math.round(totals.totalRevenue * 100) / 100,
      totalSubtotal: Math.round(totals.totalSubtotal * 100) / 100,
      totalOrders: totals.totalOrders,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    }
  };
};

const getInventoryReport = async (storeId, limit = 100) => {
  const matchStage = {};
  if (storeId) {
    matchStage.store = new mongoose.Types.ObjectId(storeId);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productData'
      }
    },
    {
      $unwind: {
        path: '$productData',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'productData.category',
        foreignField: '_id',
        as: 'categoryData'
      }
    },
    {
      $unwind: {
        path: '$categoryData',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        totalQuantity: { $sum: '$batches.quantity' }
      }
    },
    {
      $addFields: {
        isLowStock: {
          $and: [
            { $lte: ['$totalQuantity', '$lowStockThreshold'] },
            { $gt: ['$totalQuantity', 0] }
          ]
        },
        isOutOfStock: { $lte: ['$totalQuantity', 0] }
      }
    },
    {
      $project: {
        productId: '$product',
        productSku: '$productData.sku',
        productName: '$productData.name',
        category: '$categoryData.name',
        quantity: '$totalQuantity',
        batches: 1,
        lowStockThreshold: 1,
        isLowStock: 1,
        isOutOfStock: 1
      }
    },
    {
      $sort: { isOutOfStock: -1, isLowStock: -1, quantity: 1 }
    },
    {
      $limit: limit
    }
  ];

  const inventoryItems = await Inventory.aggregate(pipeline);

  // Calculate summary statistics
  const summary = inventoryItems.reduce((acc, item) => {
    acc.totalProducts++;
    if (item.isOutOfStock) acc.outOfStock++;
    else if (item.isLowStock) acc.lowStock++;
    return acc;
  }, { totalProducts: 0, lowStock: 0, outOfStock: 0 });

  return {
    items: inventoryItems,
    summary
  };
};

const getTransactionHistory = async (productId, startDate, endDate, reason, storeId, limit = 100) => {
  const matchStage = {};
  
  if (productId) {
    matchStage.product = new mongoose.Types.ObjectId(productId);
  }
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = end;
    }
  } else {
    // Default to last 30 days
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    matchStage.createdAt = {
      $gte: defaultStartDate,
      $lte: defaultEndDate
    };
  }
  
  if (reason) {
    matchStage.reason = reason;
  }
  
  if (storeId) {
    matchStage.store = new mongoose.Types.ObjectId(storeId);
  }

  const transactions = await InventoryTransaction.find(matchStage)
    .populate('product', 'sku name')
    .populate('store', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);

  return transactions;
};

const getPaymentsReport = async (startDate, endDate, storeId) => {
  // Default to last 30 days if no dates provided
  if (!startDate && !endDate) {
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    startDate = defaultStartDate.toISOString().split('T')[0];
    endDate = defaultEndDate.toISOString().split('T')[0];
  }

  const matchStage = { status: 'COMPLETED' };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) {
      matchStage.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchStage.createdAt.$lte = end;
    }
  }
  
  if (storeId) {
    matchStage.store = new mongoose.Types.ObjectId(storeId);
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: '$payments' },
    {
      $group: {
        _id: {
          method: '$payments.method',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        totalAmount: { $sum: '$payments.amount' },
        transactionCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.method',
        totalAmount: { $sum: '$totalAmount' },
        transactionCount: { $sum: '$transactionCount' },
        dailyBreakdown: {
          $push: {
            date: '$_id.date',
            amount: '$totalAmount',
            count: '$transactionCount'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        method: '$_id',
        totalAmount: { $round: ['$totalAmount', 2] },
        transactionCount: 1,
        dailyBreakdown: 1
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ];

  const paymentsByMethod = await Order.aggregate(pipeline);

  // Calculate totals
  const totals = paymentsByMethod.reduce((acc, method) => {
    acc.totalAmount += method.totalAmount;
    acc.totalTransactions += method.transactionCount;
    return acc;
  }, { totalAmount: 0, totalTransactions: 0 });

  return {
    byMethod: paymentsByMethod,
    summary: {
      totalAmount: Math.round(totals.totalAmount * 100) / 100,
      totalTransactions: totals.totalTransactions,
      period: {
        startDate: startDate || null,
        endDate: endDate || null
      }
    }
  };
};

export { getSalesSummary, getInventoryReport, getTransactionHistory, getPaymentsReport };

