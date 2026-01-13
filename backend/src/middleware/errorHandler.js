import { logAudit } from '../modules/audit/audit.service.js';

/**
 * Global error handler middleware
 * Must be added after all routes
 */
const errorHandler = (err, req, res, next) => {
  // Get request ID if available
  const requestId = req.id || req.requestId || 'unknown';

  // Default error
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError' || err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (err.code === 11000) {
    // Duplicate key error
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_ENTRY';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.name === 'MongoError' && err.code === 251) {
    // MongoDB transaction error
    statusCode = 500;
    message = 'Transaction failed, please try again';
    code = 'TRANSACTION_ERROR';
  }

  // Log critical errors to audit log
  if (statusCode >= 500) {
    logAudit({
      user: req.user?._id,
      role: req.user?.role,
      store: req.userStoreId,
      action: 'SYSTEM_ERROR',
      entityType: 'SYSTEM',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      severity: 'HIGH',
      message: `Error: ${message} (${code})`
    });
  }

  // Prepare error response
  const errorResponse = {
    error: {
      code,
      message,
      requestId
    }
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err;
  }

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      requestId,
      code,
      message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    });
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;

