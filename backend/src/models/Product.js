import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  barcode: {
    type: String,
    required: false,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  unitType: {
    type: String,
    required: true,
    enum: ['piece', 'kg', 'g', 'l', 'ml', 'pack'],
    default: 'piece'
  },
  isPerishable: {
    type: Boolean,
    required: true,
    default: false
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for fast lookups in micro-fulfillment operations
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

