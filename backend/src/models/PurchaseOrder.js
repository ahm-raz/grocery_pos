import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  expectedDeliveryDate: {
    type: Date,
    required: false
  }
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  items: [purchaseOrderItemSchema],
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'RECEIVED', 'CANCELLED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

// Indexes for fast queries
purchaseOrderSchema.index({ store: 1, status: 1, createdAt: -1 });
purchaseOrderSchema.index({ status: 1 });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;

