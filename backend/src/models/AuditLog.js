import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for system actions
  },
  role: {
    type: String,
    required: false
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: false
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'LOGIN_LOCKED',
      'LOGOUT',
      'INVENTORY_ADJUST',
      'INVENTORY_BATCH_ADD',
      'INVENTORY_BATCH_REMOVE',
      'CHECKOUT_COMPLETE',
      'PAYMENT_RECORDED',
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_ROLE_CHANGE',
      'STORE_CREATE',
      'STORE_UPDATE',
      'PRODUCT_CREATE',
      'PRODUCT_UPDATE',
      'PRODUCT_DELETE',
      'PURCHASE_ORDER_CREATE',
      'PURCHASE_ORDER_RECEIVE',
      'INTEGRITY_VIOLATION',
      'RATE_LIMIT_EXCEEDED',
      'UNAUTHORIZED_ACCESS'
    ]
  },
  entityType: {
    type: String,
    required: true,
    enum: ['USER', 'INVENTORY', 'ORDER', 'PAYMENT', 'PRODUCT', 'STORE', 'AUTH', 'SYSTEM']
  },
  entityId: {
    type: String,
    required: false
  },
  before: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  after: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  message: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ store: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;

