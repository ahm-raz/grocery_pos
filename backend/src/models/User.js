import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  passwordHash: {
    type: String,
    required: true,
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    required: true,
    enum: ['ADMIN', 'MANAGER', 'CASHIER', 'WAREHOUSE', 'ACCOUNTANT'],
    default: 'CASHIER'
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  failedLoginCount: {
    type: Number,
    default: 0
  },
  lastFailedAt: {
    type: Date,
    required: false
  },
  lockedUntil: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for fast lookups
userSchema.index({ email: 1 });
userSchema.index({ store: 1, isActive: 1 });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

export default User;

