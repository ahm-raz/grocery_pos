import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Store from '../src/models/Store.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const createAllUsers = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      mongoURI = 'mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0';
      console.log('⚠️  No MONGODB_URI in .env, using default MongoDB Atlas connection');
    }
    
    console.log(`Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected to MongoDB\n');

    // Create a default store if it doesn't exist
    let store = await Store.findOne();
    if (!store) {
      console.log('Creating default store...');
      store = new Store({
        name: 'Main Store',
        address: '123 Grocery Street',
        storeCode: 'MAIN001',
        isActive: true
      });
      await store.save();
      console.log('✓ Default store created\n');
    }

    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'ADMIN',
        store: null // ADMIN doesn't need a store
      },
      {
        name: 'Manager User',
        email: 'manager@test.com',
        password: 'manager123',
        role: 'MANAGER',
        store: store._id
      },
      {
        name: 'Cashier User',
        email: 'cashier@test.com',
        password: 'cashier123',
        role: 'CASHIER',
        store: store._id
      },
      {
        name: 'Warehouse User',
        email: 'warehouse@test.com',
        password: 'warehouse123',
        role: 'WAREHOUSE',
        store: store._id
      },
      {
        name: 'Accountant User',
        email: 'accountant@test.com',
        password: 'accountant123',
        role: 'ACCOUNTANT',
        store: store._id
      }
    ];

    console.log('Creating users for all roles...\n');

    for (const userData of users) {
      // Check if user already exists
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Create password hash
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = new User({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        store: userData.store,
        isActive: true
      });
      
      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 ALL USER CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    users.forEach(user => {
      console.log(`Role:     ${user.role.padEnd(12)} Email: ${user.email.padEnd(20)} Password: ${user.password}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  }
};

createAllUsers();

