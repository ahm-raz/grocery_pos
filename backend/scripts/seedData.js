import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import Store from '../src/models/Store.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import Inventory from '../src/models/Inventory.js';

// Determine MongoDB URI
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  // Default to MongoDB Atlas
  mongoUri = 'mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0';
}

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Get or create default store
    let store = await Store.findOne({ storeCode: 'STORE001' });
    if (!store) {
      store = await Store.create({
        name: 'Main Grocery Store',
        storeCode: 'STORE001',
        address: '123 Main Street, City, State 12345',
        timezone: 'America/New_York',
        currency: 'USD',
        contactInfo: {
          phone: '+1-555-0123',
          email: 'store@example.com'
        },
        isActive: true
      });
      console.log('✓ Created default store');
    } else {
      console.log('✓ Using existing store');
    }

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    console.log('✓ Cleared existing data\n');

    // 1. Create Categories
    console.log('Creating categories...');
    const categories = await Category.insertMany([
      { name: 'fruits', description: 'Fresh fruits' },
      { name: 'vegetables', description: 'Fresh vegetables' },
      { name: 'dairy', description: 'Dairy products' },
      { name: 'meat', description: 'Meat and poultry' },
      { name: 'beverages', description: 'Drinks and beverages' },
      { name: 'snacks', description: 'Snacks and chips' },
      { name: 'bakery', description: 'Bread and baked goods' },
      { name: 'frozen', description: 'Frozen foods' },
      { name: 'canned', description: 'Canned goods' },
      { name: 'cleaning', description: 'Cleaning supplies' }
    ]);
    console.log(`✓ Created ${categories.length} categories\n`);

    // 2. Create Products
    console.log('Creating products...');
    const products = await Product.insertMany([
      // Fruits
      { sku: 'FRUIT-001', name: 'Apple - Red Delicious', barcode: '1234567890123', category: categories[0]._id, unitType: 'kg', isPerishable: true, price: 2.99 },
      { sku: 'FRUIT-002', name: 'Banana', barcode: '1234567890124', category: categories[0]._id, unitType: 'kg', isPerishable: true, price: 1.99 },
      { sku: 'FRUIT-003', name: 'Orange - Navel', barcode: '1234567890125', category: categories[0]._id, unitType: 'kg', isPerishable: true, price: 3.49 },
      { sku: 'FRUIT-004', name: 'Strawberries', barcode: '1234567890126', category: categories[0]._id, unitType: 'pack', isPerishable: true, price: 4.99 },
      
      // Vegetables
      { sku: 'VEG-001', name: 'Carrot', barcode: '1234567890127', category: categories[1]._id, unitType: 'kg', isPerishable: true, price: 1.49 },
      { sku: 'VEG-002', name: 'Tomato', barcode: '1234567890128', category: categories[1]._id, unitType: 'kg', isPerishable: true, price: 2.99 },
      { sku: 'VEG-003', name: 'Lettuce - Iceberg', barcode: '1234567890129', category: categories[1]._id, unitType: 'piece', isPerishable: true, price: 1.99 },
      { sku: 'VEG-004', name: 'Onion - Yellow', barcode: '1234567890130', category: categories[1]._id, unitType: 'kg', isPerishable: true, price: 1.29 },
      
      // Dairy
      { sku: 'DAIRY-001', name: 'Milk - Whole 1L', barcode: '1234567890131', category: categories[2]._id, unitType: 'l', isPerishable: true, price: 3.49 },
      { sku: 'DAIRY-002', name: 'Eggs - Large Dozen', barcode: '1234567890132', category: categories[2]._id, unitType: 'pack', isPerishable: true, price: 2.99 },
      { sku: 'DAIRY-003', name: 'Butter - Unsalted 250g', barcode: '1234567890133', category: categories[2]._id, unitType: 'piece', isPerishable: true, price: 4.99 },
      { sku: 'DAIRY-004', name: 'Cheese - Cheddar 500g', barcode: '1234567890134', category: categories[2]._id, unitType: 'piece', isPerishable: true, price: 6.99 },
      
      // Meat
      { sku: 'MEAT-001', name: 'Chicken Breast - 1kg', barcode: '1234567890135', category: categories[3]._id, unitType: 'kg', isPerishable: true, price: 8.99 },
      { sku: 'MEAT-002', name: 'Ground Beef - 500g', barcode: '1234567890136', category: categories[3]._id, unitType: 'g', isPerishable: true, price: 5.99 },
      { sku: 'MEAT-003', name: 'Salmon Fillet - 300g', barcode: '1234567890137', category: categories[3]._id, unitType: 'g', isPerishable: true, price: 12.99 },
      
      // Beverages
      { sku: 'BEV-001', name: 'Water - 500ml', barcode: '1234567890138', category: categories[4]._id, unitType: 'piece', isPerishable: false, price: 0.99 },
      { sku: 'BEV-002', name: 'Cola - 2L', barcode: '1234567890139', category: categories[4]._id, unitType: 'piece', isPerishable: false, price: 2.49 },
      { sku: 'BEV-003', name: 'Orange Juice - 1L', barcode: '1234567890140', category: categories[4]._id, unitType: 'l', isPerishable: true, price: 3.99 },
      
      // Snacks
      { sku: 'SNACK-001', name: 'Potato Chips - 200g', barcode: '1234567890141', category: categories[5]._id, unitType: 'piece', isPerishable: false, price: 2.99 },
      { sku: 'SNACK-002', name: 'Chocolate Bar', barcode: '1234567890142', category: categories[5]._id, unitType: 'piece', isPerishable: false, price: 1.99 },
      { sku: 'SNACK-003', name: 'Cookies - 300g', barcode: '1234567890143', category: categories[5]._id, unitType: 'piece', isPerishable: false, price: 3.49 },
      
      // Bakery
      { sku: 'BAKE-001', name: 'White Bread - Loaf', barcode: '1234567890144', category: categories[6]._id, unitType: 'piece', isPerishable: true, price: 2.49 },
      { sku: 'BAKE-002', name: 'Croissant', barcode: '1234567890145', category: categories[6]._id, unitType: 'piece', isPerishable: true, price: 1.99 },
      
      // Frozen
      { sku: 'FROZ-001', name: 'Frozen Pizza - Margherita', barcode: '1234567890146', category: categories[7]._id, unitType: 'piece', isPerishable: false, price: 4.99 },
      { sku: 'FROZ-002', name: 'Ice Cream - Vanilla 500ml', barcode: '1234567890147', category: categories[7]._id, unitType: 'piece', isPerishable: false, price: 5.99 },
      
      // Canned
      { sku: 'CANN-001', name: 'Tomato Soup - 400g', barcode: '1234567890148', category: categories[8]._id, unitType: 'piece', isPerishable: false, price: 1.99 },
      { sku: 'CANN-002', name: 'Beans - Baked 400g', barcode: '1234567890149', category: categories[8]._id, unitType: 'piece', isPerishable: false, price: 1.49 },
      
      // Cleaning
      { sku: 'CLEAN-001', name: 'Dish Soap - 500ml', barcode: '1234567890150', category: categories[9]._id, unitType: 'piece', isPerishable: false, price: 2.99 },
      { sku: 'CLEAN-002', name: 'Laundry Detergent - 2L', barcode: '1234567890151', category: categories[9]._id, unitType: 'piece', isPerishable: false, price: 8.99 }
    ]);
    console.log(`✓ Created ${products.length} products\n`);

    // 3. Create Inventory with Batches
    console.log('Creating inventory with batches...');
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    const nearExpiryDate = new Date(now);
    nearExpiryDate.setDate(nearExpiryDate.getDate() + 5); // 5 days from now

    const inventoryItems = [];
    
    // Perishable items with expiry dates
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const batches = [];
      
      if (product.isPerishable) {
        // Create 1-3 batches for perishable items
        const batchCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < batchCount; j++) {
          const expiryDate = j === 0 ? nearExpiryDate : futureDate; // First batch expires soon
          batches.push({
            batchNumber: `BATCH-${product.sku}-${j + 1}`,
            quantity: Math.floor(Math.random() * 50) + 10,
            expiryDate: expiryDate,
            receivedDate: new Date(now.getTime() - (j * 24 * 60 * 60 * 1000)) // Received at different times
          });
        }
      } else {
        // Non-perishable items - single batch
        batches.push({
          batchNumber: `BATCH-${product.sku}-1`,
          quantity: Math.floor(Math.random() * 100) + 20,
          receivedDate: new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000))
        });
      }

      inventoryItems.push({
        product: product._id,
        store: store._id,
        batches: batches,
        lowStockThreshold: product.isPerishable ? 10 : 20
      });
    }

    await Inventory.insertMany(inventoryItems);
    console.log(`✓ Created inventory for ${inventoryItems.length} products\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SEED DATA CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Store: ${store.name} (${store.storeCode})`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Inventory Items: ${inventoryItems.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

