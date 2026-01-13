import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  storeCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  address: {
    type: String,
    required: false,
    trim: true
  },
  timezone: {
    type: String,
    required: false,
    default: 'UTC'
  },
  currency: {
    type: String,
    required: false,
    default: 'USD'
  },
  contactInfo: {
    phone: String,
    email: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast lookups
storeSchema.index({ isActive: 1 });
storeSchema.index({ storeCode: 1 });

const Store = mongoose.model('Store', storeSchema);

export default Store;

