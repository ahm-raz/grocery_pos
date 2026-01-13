import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID middleware for traceability
 * Adds unique request ID to each request
 */
const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

export default requestId;

