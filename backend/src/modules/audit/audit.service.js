import AuditLog from '../../models/AuditLog.js';

/**
 * Non-blocking audit logging service
 * Failures to log should never crash the application
 */
const logAudit = async (auditData) => {
  try {
    const {
      user,
      role,
      store,
      action,
      entityType,
      entityId,
      before,
      after,
      ipAddress,
      userAgent,
      severity = 'MEDIUM',
      message
    } = auditData;

    const auditLog = new AuditLog({
      user: user?._id || user,
      role: role || user?.role,
      store: store?._id || store,
      action,
      entityType,
      entityId: entityId?.toString() || entityId,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
      ipAddress,
      userAgent,
      severity,
      message
    });

    // Fire and forget - don't await to avoid blocking
    auditLog.save().catch((error) => {
      // Silently log to console in development, but don't throw
      if (process.env.NODE_ENV === 'development') {
        console.error('Audit log save failed:', error);
      }
    });
  } catch (error) {
    // Never throw - audit logging failures should not affect core functionality
    if (process.env.NODE_ENV === 'development') {
      console.error('Audit log creation failed:', error);
    }
  }
};

/**
 * Helper to extract audit context from request
 */
const getAuditContext = (req) => {
  return {
    user: req.user,
    role: req.user?.role,
    store: req.userStoreId ? { _id: req.userStoreId } : null,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  };
};

export { logAudit, getAuditContext };

