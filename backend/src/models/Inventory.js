import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: false
  },
  receivedDate: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const inventorySchema = new mongoose.Schema({
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
  batches: [batchSchema],
  lowStockThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  }
}, {
  timestamps: true
});

// Virtual for total quantity (sum of all batches)
inventorySchema.virtual('quantity').get(function() {
  return this.batches.reduce((sum, batch) => sum + batch.quantity, 0);
});

// Compound index for fast inventory lookups (product + store)
inventorySchema.index({ product: 1, store: 1 }, { unique: true });
// Index for batch queries
inventorySchema.index({ 'batches.expiryDate': 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;

