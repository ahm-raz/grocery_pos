import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  changeType: {
    type: String,
    required: true,
    enum: ['IN', 'OUT']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    enum: ['RESTOCK', 'DAMAGE', 'EXPIRED', 'MANUAL', 'SALE', 'PO_RECEIPT'],
    default: 'MANUAL'
  },
  batchNumber: {
    type: String,
    required: false,
    trim: true
  },
  previousQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  newQuantity: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for fast history queries
inventoryTransactionSchema.index({ product: 1, store: 1, createdAt: -1 });
inventoryTransactionSchema.index({ createdAt: -1 });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransaction;

