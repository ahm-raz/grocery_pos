# Quick Data Insertion Guide

## 🚀 Fastest Way: Use Seed Script

```bash
cd backend
npm run seed
# or
node scripts/seedData.js
```

This creates:
- ✅ 1 Store (STORE001)
- ✅ 10 Categories
- ✅ 30+ Products
- ✅ Inventory with batches

---

## 📝 Manual Insertion (Step by Step)

### 1. Login & Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "admin123"}'
```

**Save the `token` from response!**

---

### 2. Create Category

```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "fruits",
    "description": "Fresh fruits"
  }'
```

**Save the `_id` from response!**

---

### 3. Create Product

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sku": "FRUIT-001",
    "name": "Apple - Red Delicious",
    "barcode": "1234567890123",
    "category": "CATEGORY_ID_FROM_STEP_2",
    "unitType": "kg",
    "isPerishable": true,
    "price": 2.99
  }'
```

**Save the `_id` from response!**

---

### 4. Get Store ID

```bash
curl -X GET http://localhost:5000/api/store \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Save the `_id` from response!**

---

### 5. Create Inventory Entry

```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product": "PRODUCT_ID_FROM_STEP_3",
    "store": "STORE_ID_FROM_STEP_4",
    "lowStockThreshold": 10
  }'
```

---

### 6. Add Stock (Stock IN)

```bash
curl -X POST http://localhost:5000/api/inventory/adjust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID_FROM_STEP_3",
    "storeId": "STORE_ID_FROM_STEP_4",
    "changeType": "IN",
    "quantity": 100,
    "reason": "RESTOCK",
    "batchNumber": "BATCH-001",
    "expiryDate": "2024-12-31T00:00:00.000Z"
  }'
```

---

## 📋 Field Reference

### Category
- `name` (required, unique, lowercase) - e.g., "fruits"
- `description` (optional)

### Product
- `sku` (required, unique, uppercase) - e.g., "FRUIT-001"
- `name` (required)
- `barcode` (optional)
- `category` (required, ObjectId)
- `unitType` (required) - "piece" | "kg" | "g" | "l" | "ml" | "pack"
- `isPerishable` (required) - true/false
- `price` (required, number ≥ 0)

### Inventory Adjustment
- `productId` (required, ObjectId)
- `storeId` (required, ObjectId)
- `changeType` (required) - "IN" | "OUT"
- `quantity` (required, number ≥ 0)
- `reason` (required) - "RESTOCK" | "DAMAGE" | "EXPIRED" | "MANUAL" | "SALE" | "PO_RECEIPT"
- `batchNumber` (optional, required for IN)
- `expiryDate` (optional, ISO date string)

---

## 💡 Tips

1. **Order matters:** Categories → Products → Inventory → Stock
2. **Use seed script** for quick setup
3. **Check IDs** after each step
4. **Batch numbers** format: `BATCH-{SKU}-{NUMBER}`
5. **Expiry dates** only for perishable items

---

## 🔍 Verify Data

```bash
# List all categories
curl -X GET http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN"

# List all products
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# List all inventory
curl -X GET http://localhost:5000/api/inventory \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

For detailed guide, see [DATA_INSERTION_GUIDE.md](./DATA_INSERTION_GUIDE.md)

