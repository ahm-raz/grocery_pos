import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const options = {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeout settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Retry settings
      retryWrites: true,
      retryReads: true,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);

    // Create indexes on startup (idempotent)
    await createIndexes();

    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    // Note: Graceful shutdown is handled in server.js to avoid duplicate handlers

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Create database indexes (idempotent - safe to run multiple times)
 * This ensures indexes are created early and can verify their existence
 */
const createIndexes = async () => {
  try {
    console.log('Creating database indexes...');
    
    // Sync all model indexes - Mongoose will create indexes defined in schemas
    // This ensures indexes exist before the application starts handling requests
    await Promise.all([
      mongoose.model('User').syncIndexes(),
      mongoose.model('Store').syncIndexes(),
      mongoose.model('Category').syncIndexes(),
      mongoose.model('Product').syncIndexes(),
      mongoose.model('Inventory').syncIndexes(),
      mongoose.model('Cart').syncIndexes(),
      mongoose.model('Order').syncIndexes(),
      mongoose.model('InventoryTransaction').syncIndexes(),
      mongoose.model('PurchaseOrder').syncIndexes(),
      mongoose.model('AuditLog').syncIndexes()
    ]).catch((err) => {
      // If models aren't loaded yet, that's okay - they'll create indexes on first use
      if (err.name !== 'MissingSchemaError') {
        throw err;
      }
    });
    
    console.log('✓ Database indexes ready');
  } catch (error) {
    console.error('Error creating indexes:', error);
    // Don't fail startup if index creation fails - indexes will be created on first use
  }
};

export default connectDB;
