import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  }
}, {
  timestamps: true
});

// Index for fast category lookups in inventory grouping
categorySchema.index({ name: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;

