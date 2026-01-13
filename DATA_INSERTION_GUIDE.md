# Data Insertion Guide

This guide explains how to manually insert data into the Grocery POS system, including categories, products, inventory, and stock.

## Table of Contents
1. [Quick Start - Using Seed Script](#quick-start---using-seed-script)
2. [Manual Data Insertion via API](#manual-data-insertion-via-api)
3. [Manual Data Insertion via MongoDB](#manual-data-insertion-via-mongodb)
4. [Data Structure Reference](#data-structure-reference)

---

## Quick Start - Using Seed Script

The easiest way to populate your database with sample data:

```bash
# Navigate to backend directory
cd backend

# Run the seed script
node scripts/seedData.js
```

This will create:
- 1 Store (STORE001)
- 10 Categories (Fruits, Vegetables, Dairy, Meat, Beverages, Snacks, Bakery, Frozen, Canned, Cleaning)
- 30+ Products across all categories
- Inventory entries with batches for all products

**Note:** The script will **clear existing categories, products, and inventory** before inserting new data. Comment out the deletion lines in the script if you want to keep existing data.

---

## Manual Data Insertion via API

### Prerequisites
1. Backend server must be running
2. You need a valid JWT token (login first)
3. Use Postman, cURL, or the frontend interface

### Step 1: Login to Get JWT Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

Save the `token` from the response.

### Step 2: Create Categories

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "fruits",
    "description": "Fresh fruits"
  }'
```

**Required Fields:**
- `name` (string, unique, lowercase) - e.g., "fruits", "vegetables", "dairy"
- `description` (string, optional)

**Example Categories:**
```json
{"name": "fruits", "description": "Fresh fruits"}
{"name": "vegetables", "description": "Fresh vegetables"}
{"name": "dairy", "description": "Dairy products"}
{"name": "meat", "description": "Meat and poultry"}
{"name": "beverages", "description": "Drinks and beverages"}
{"name": "snacks", "description": "Snacks and chips"}
{"name": "bakery", "description": "Bread and baked goods"}
{"name": "frozen", "description": "Frozen foods"}
{"name": "canned", "description": "Canned goods"}
{"name": "cleaning", "description": "Cleaning supplies"}
```

### Step 3: Get Category IDs

```bash
curl -X GET http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Note the `_id` of each category for the next step.

### Step 4: Create Products

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sku": "FRUIT-001",
    "name": "Apple - Red Delicious",
    "barcode": "1234567890123",
    "category": "CATEGORY_ID_HERE",
    "unitType": "kg",
    "isPerishable": true,
    "price": 2.99
  }'
```

**Required Fields:**
- `sku` (string, unique, uppercase) - e.g., "FRUIT-001"
- `name` (string) - Product name
- `category` (ObjectId) - Category ID from Step 3
- `unitType` (enum) - One of: "piece", "kg", "g", "l", "ml", "pack"
- `isPerishable` (boolean) - true for items with expiry dates
- `price` (number, min: 0) - Price per unit

**Optional Fields:**
- `barcode` (string) - Barcode for scanning

**Example Products:**
```json
{
  "sku": "FRUIT-001",
  "name": "Apple - Red Delicious",
  "barcode": "1234567890123",
  "category": "CATEGORY_ID",
  "unitType": "kg",
  "isPerishable": true,
  "price": 2.99
}
```

### Step 5: Get Store ID

```bash
curl -X GET http://localhost:5000/api/store \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Note the `_id` of your store.

### Step 6: Create Inventory

First, create an inventory entry for a product:

```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "product": "PRODUCT_ID_HERE",
    "store": "STORE_ID_HERE",
    "lowStockThreshold": 10
  }'
```

### Step 7: Add Stock to Inventory (Stock IN)

```bash
curl -X POST http://localhost:5000/api/inventory/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID_HERE",
    "storeId": "STORE_ID_HERE",
    "changeType": "IN",
    "quantity": 50,
    "reason": "RESTOCK",
    "batchNumber": "BATCH-001",
    "expiryDate": "2024-12-31T00:00:00.000Z"
  }'
```

**Required Fields:**
- `productId` (ObjectId) - Product ID
- `storeId` (ObjectId) - Store ID
- `changeType` (enum) - "IN" or "OUT"
- `quantity` (number, min: 0) - Quantity to add/remove
- `reason` (enum) - "RESTOCK", "DAMAGE", "EXPIRED", "MANUAL", "SALE", "PO_RECEIPT"

**Optional Fields (for batch tracking):**
- `batchNumber` (string) - Batch identifier
- `expiryDate` (ISO date string) - Expiry date for perishable items

**Example Stock IN:**
```json
{
  "productId": "PRODUCT_ID",
  "storeId": "STORE_ID",
  "changeType": "IN",
  "quantity": 100,
  "reason": "RESTOCK",
  "batchNumber": "BATCH-FRUIT-001-1",
  "expiryDate": "2024-12-31T00:00:00.000Z"
}
```

---

## Manual Data Insertion via MongoDB

If you prefer to insert data directly into MongoDB:

### Connect to MongoDB

**Using MongoDB Atlas (Recommended):**
```bash
# Using MongoDB shell
mongosh "mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0"

# Or using MongoDB Compass
# Connect to: mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0
```

**Using Local MongoDB:**
```bash
# Using MongoDB shell
mongosh mongodb://localhost:27017/grocery_pos

# Or using MongoDB Compass
# Connect to: mongodb://localhost:27017
# Database: grocery_pos
```

### 1. Insert Categories

```javascript
db.categories.insertMany([
  { name: "fruits", description: "Fresh fruits" },
  { name: "vegetables", description: "Fresh vegetables" },
  { name: "dairy", description: "Dairy products" },
  { name: "meat", description: "Meat and poultry" },
  { name: "beverages", description: "Drinks and beverages" }
]);
```

### 2. Get Category IDs

```javascript
db.categories.find({}, { _id: 1, name: 1 })
```

### 3. Insert Products

```javascript
// Get a category ID first
var fruitCategory = db.categories.findOne({ name: "fruits" });

db.products.insertOne({
  sku: "FRUIT-001",
  name: "Apple - Red Delicious",
  barcode: "1234567890123",
  category: fruitCategory._id,
  unitType: "kg",
  isPerishable: true,
  price: 2.99
});
```

### 4. Get Store ID

```javascript
var store = db.stores.findOne({ storeCode: "STORE001" });
```

### 5. Create Inventory Entry

```javascript
var product = db.products.findOne({ sku: "FRUIT-001" });
var store = db.stores.findOne({ storeCode: "STORE001" });

db.inventories.insertOne({
  product: product._id,
  store: store._id,
  batches: [
    {
      batchNumber: "BATCH-001",
      quantity: 50,
      expiryDate: new Date("2024-12-31"),
      receivedDate: new Date()
    }
  ],
  lowStockThreshold: 10
});
```

---

## Data Structure Reference

### Category Schema
```javascript
{
  name: String,        // Required, unique, lowercase
  description: String // Optional
}
```

### Product Schema
```javascript
{
  sku: String,              // Required, unique, uppercase
  name: String,             // Required
  barcode: String,          // Optional
  category: ObjectId,       // Required, ref: Category
  unitType: String,         // Required: "piece" | "kg" | "g" | "l" | "ml" | "pack"
  isPerishable: Boolean,     // Required, default: false
  price: Number             // Required, min: 0
}
```

### Inventory Schema
```javascript
{
  product: ObjectId,        // Required, ref: Product
  store: ObjectId,          // Required, ref: Store
  batches: [{
    batchNumber: String,    // Required
    quantity: Number,       // Required, min: 0
    expiryDate: Date,        // Optional
    receivedDate: Date      // Default: now
  }],
  lowStockThreshold: Number // Required, min: 0, default: 10
}
```

### Inventory Transaction Schema
```javascript
{
  product: ObjectId,        // Required, ref: Product
  store: ObjectId,          // Required, ref: Store
  changeType: String,       // Required: "IN" | "OUT"
  quantity: Number,        // Required, min: 0
  reason: String,           // Required: "RESTOCK" | "DAMAGE" | "EXPIRED" | "MANUAL" | "SALE" | "PO_RECEIPT"
  batchNumber: String,      // Optional
  previousQuantity: Number, // Required, min: 0
  newQuantity: Number       // Required, min: 0
}
```

---

## Tips & Best Practices

1. **Order of Operations:**
   - Always create Categories first
   - Then create Products (requires Category IDs)
   - Then create Inventory entries (requires Product and Store IDs)
   - Finally, adjust stock using the inventory adjustment endpoint

2. **SKU Format:**
   - Use consistent format: `CATEGORY-###`
   - Examples: `FRUIT-001`, `DAIRY-002`, `MEAT-003`

3. **Barcode Format:**
   - Use 13-digit EAN-13 format (standard barcode)
   - Or any unique identifier

4. **Batch Numbers:**
   - Format: `BATCH-{SKU}-{NUMBER}`
   - Example: `BATCH-FRUIT-001-1`

5. **Expiry Dates:**
   - Only required for perishable items
   - Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
   - Example: `2024-12-31T00:00:00.000Z`

6. **Low Stock Threshold:**
   - Set based on product type
   - Perishable items: 10-20 units
   - Non-perishable items: 20-50 units

---

## Troubleshooting

### Error: "Category not found"
- Make sure you created the category first
- Verify the category ID is correct

### Error: "Product SKU already exists"
- SKUs must be unique
- Use a different SKU or delete the existing product

### Error: "Store not found"
- Make sure a store exists (created by user script)
- Verify the store ID is correct

### Error: "Inventory already exists for this product and store"
- Each product can only have one inventory entry per store
- Use the adjustment endpoint to modify stock

---

## Next Steps

After inserting data:
1. View products in the frontend: `/inventory`
2. Check stock levels: `/inventory`
3. Test POS functionality: `/pos`
4. View reports: `/reports`

For more information, see the main [README.md](./README.md).

