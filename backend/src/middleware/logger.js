/**
 * Structured logging middleware
 * Logs all requests with request ID and timing
 */

const logLevels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

const shouldLog = (level) => {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || (env === 'production' ? 'INFO' : 'DEBUG');
  
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
  const currentLevelIndex = levels.indexOf(logLevel);
  const messageLevelIndex = levels.indexOf(level);
  
  return messageLevelIndex >= currentLevelIndex;
};

const formatLog = (level, message, data = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };

  // In production, output JSON; in development, pretty print
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(logEntry);
  } else {
    return `${logEntry.timestamp} [${level}] ${message} ${Object.keys(data).length > 0 ? JSON.stringify(data, null, 2) : ''}`;
  }
};

const logger = {
  info: (message, data) => {
    if (shouldLog('INFO')) {
      console.log(formatLog(logLevels.INFO, message, data));
    }
  },
  warn: (message, data) => {
    if (shouldLog('WARN')) {
      console.warn(formatLog(logLevels.WARN, message, data));
    }
  },
  error: (message, data) => {
    if (shouldLog('ERROR')) {
      console.error(formatLog(logLevels.ERROR, message, data));
    }
  },
  critical: (message, data) => {
    if (shouldLog('CRITICAL')) {
      console.error(formatLog(logLevels.CRITICAL, message, data));
    }
  }
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.id || req.requestId || 'unknown';

  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };

    // Log slow queries
    const slowQueryThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000');
    if (duration > slowQueryThreshold) {
      logger.warn('Slow request detected', {
        ...logData,
        threshold: `${slowQueryThreshold}ms`
      });
    } else if (res.statusCode >= 400) {
      logger.error('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

export default logger;
export { requestLogger };

