import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const createAdmin = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      // Default to MongoDB Atlas
      mongoURI = 'mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0';
      console.log('⚠️  No MONGODB_URI in .env, using default MongoDB Atlas connection');
    }
    
    console.log(`Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email: admin@test.com');
      console.log('To reset password, delete the user first.');
      process.exit(0);
    }

    // Create password hash
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash,
      role: 'ADMIN',
      isActive: true
    });
    
    await admin.save();
    
    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@test.com');
    console.log('Password: admin123');
    console.log('Role:     ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();

