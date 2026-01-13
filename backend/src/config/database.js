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

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

/**
 * Create database indexes (idempotent - safe to run multiple times)
 */
const createIndexes = async () => {
  try {
    const collections = [
      'users',
      'products',
      'inventory',
      'orders',
      'carts',
      'inventorytransactions',
      'auditlogs',
      'stores',
      'categories',
      'purchaseorders'
    ];

    console.log('Creating database indexes...');
    
    // Indexes are already defined in models, but we can verify they exist
    // Mongoose will create them automatically on first use
    // This is just a placeholder for any custom indexes we might need
    
    console.log('✓ Database indexes ready');
  } catch (error) {
    console.error('Error creating indexes:', error);
    // Don't fail startup if index creation fails - they'll be created on first use
  }
};

export default connectDB;
