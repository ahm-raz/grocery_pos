import Product from '../../models/Product.js';
import Inventory from '../../models/Inventory.js';
import Category from '../../models/Category.js';
import mongoose from 'mongoose';

const getProductsWithAvailability = async (storeId) => {
  // Aggregation pipeline to join Product, Inventory, and Category
  // Using $lookup to avoid N+1 queries
  const pipeline = [
    {
      $lookup: {
        from: 'inventories',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$product', '$$productId'] },
                  ...(storeId ? [{ $eq: ['$store', new mongoose.Types.ObjectId(storeId)] }] : [])
                ]
              }
            }
          },
          { $limit: 1 }
        ],
        as: 'inventory'
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
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
        availableQuantity: {
          $ifNull: [
            { $sum: { $arrayElemAt: ['$inventory.batches.quantity', 0] } },
            0
          ]
        },
        lowStockThreshold: {
          $ifNull: [{ $arrayElemAt: ['$inventory.lowStockThreshold', 0] }, 10]
        }
      }
    },
    {
      $addFields: {
        isLowStock: {
          $and: [
            { $lte: ['$availableQuantity', '$lowStockThreshold'] },
            { $gt: ['$availableQuantity', 0] }
          ]
        },
        isOutOfStock: { $lte: ['$availableQuantity', 0] }
      }
    },
    {
      $project: {
        productId: '$_id',
        name: 1,
        sku: 1,
        barcode: 1,
        price: 1,
        unitType: 1,
        category: '$categoryData.name',
        availableQuantity: 1,
        isLowStock: 1,
        isOutOfStock: 1
      }
    },
    {
      $sort: { name: 1 }
    }
  ];

  const products = await Product.aggregate(pipeline);
  return products;
};

const searchProducts = async (storeId, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }

  const trimmedSearch = searchTerm.trim();
  // Escape special regex characters to prevent regex injection
  const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const searchRegex = new RegExp(escapedSearch, 'i');
  
  // Build match conditions for SKU, barcode, or name
  // Handle null/empty barcode by checking if it exists first
  const matchStage = {
    $or: [
      { sku: { $regex: escapedSearch, $options: 'i' } },
      { name: { $regex: escapedSearch, $options: 'i' } },
      { 
        $and: [
          { barcode: { $exists: true, $ne: null, $ne: '' } },
          { barcode: { $regex: escapedSearch, $options: 'i' } }
        ]
      }
    ]
  };

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'inventories',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$product', '$$productId'] },
                  ...(storeId ? [{ $eq: ['$store', new mongoose.Types.ObjectId(storeId)] }] : [])
                ]
              }
            }
          },
          { $limit: 1 }
        ],
        as: 'inventory'
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
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
        availableQuantity: {
          $ifNull: [
            { $sum: { $arrayElemAt: ['$inventory.batches.quantity', 0] } },
            0
          ]
        },
        lowStockThreshold: {
          $ifNull: [{ $arrayElemAt: ['$inventory.lowStockThreshold', 0] }, 10]
        }
      }
    },
    {
      $addFields: {
        isLowStock: {
          $and: [
            { $lte: ['$availableQuantity', '$lowStockThreshold'] },
            { $gt: ['$availableQuantity', 0] }
          ]
        },
        isOutOfStock: { $lte: ['$availableQuantity', 0] }
      }
    },
    {
      $project: {
        productId: '$_id',
        name: 1,
        sku: 1,
        barcode: 1,
        price: 1,
        unitType: 1,
        category: '$categoryData.name',
        availableQuantity: 1,
        isLowStock: 1,
        isOutOfStock: 1
      }
    },
    {
      $limit: 50
    }
  ];

  const products = await Product.aggregate(pipeline);
  return products;
};

export { getProductsWithAvailability, searchProducts };

