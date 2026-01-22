import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import validateEnv from './config/envValidation.js';
import requestId from './middleware/requestId.js';
import errorHandler from './middleware/errorHandler.js';
import { authRateLimiter, posRateLimiter, reportsRateLimiter, apiRateLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/logger.js';
import healthRoutes from './modules/health/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import storeRoutes from './modules/stores/stores.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import productRoutes from './modules/products/products.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import posRoutes from './modules/cart/cart.routes.js';
import reportRoutes from './modules/reports/reports.routes.js';
import purchaseOrderRoutes from './modules/purchase-orders/purchaseOrders.routes.js';
import alertRoutes from './modules/alerts/alerts.routes.js';
import receiptRoutes from './modules/receipts/receipts.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';

dotenv.config();

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
let server;

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security headers (helmet)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false
}));

// Request ID middleware (must be early)
app.use(requestId);

// Request logging middleware
app.use(requestLogger);

// Response compression
app.use(compression());

// CORS configuration - secure defaults
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true, // Allow all in development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes with rate limiting
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/users', apiRateLimiter, userRoutes);
app.use('/api/store', apiRateLimiter, storeRoutes);
app.use('/api/categories', apiRateLimiter, categoryRoutes);
app.use('/api/products', apiRateLimiter, productRoutes);
app.use('/api/inventory', apiRateLimiter, inventoryRoutes);
app.use('/api/pos', posRateLimiter, posRoutes);
app.use('/api/reports', reportsRateLimiter, reportRoutes);
app.use('/api/purchase-orders', apiRateLimiter, purchaseOrderRoutes);
app.use('/api/alerts', apiRateLimiter, alertRoutes);
app.use('/api/receipts', apiRateLimiter, receiptRoutes);
app.use('/api/audit-logs', apiRateLimiter, auditRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
  
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');
      
      // Close MongoDB connection
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
      } catch (error) {
        console.error('Error closing MongoDB connection:', error);
      }
      
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

// Connect to MongoDB and start server
(async () => {
  try {
    await connectDB();
    
    // Start server only after database connection is established
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

