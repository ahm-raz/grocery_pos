# Role-Based Permissions Guide

This document outlines all permissions and access levels for each role in the Grocery POS system.

---

## 🔐 Role Hierarchy

1. **ADMIN** - Full system access
2. **MANAGER** - Store-level management
3. **CASHIER** - POS operations
4. **WAREHOUSE** - Inventory management
5. **ACCOUNTANT** - Financial reporting

---

## 👤 ADMIN

**Full system access with no restrictions.**

### User Management
- ✅ Create users (`POST /api/users`)
- ✅ View all users (`GET /api/users`)
- ✅ View user details (`GET /api/users/:id`)
- ✅ Update users (`PUT /api/users/:id`)
- ✅ Delete/deactivate users (`DELETE /api/users/:id`)
- ✅ Access all stores (no store restrictions)

### Products & Categories
- ✅ Create products (`POST /api/products`)
- ✅ View all products (`GET /api/products`)
- ✅ Update products (`PUT /api/products/:id`)
- ✅ Delete products (`DELETE /api/products/:id`)
- ✅ Create categories (`POST /api/categories`)
- ✅ View all categories (`GET /api/categories`)
- ✅ Update categories (`PUT /api/categories/:id`)
- ✅ Delete categories (`DELETE /api/categories/:id`)

### Inventory Management
- ✅ Create inventory entries (`POST /api/inventory`)
- ✅ View all inventory (`GET /api/inventory`)
- ✅ View low stock items (`GET /api/inventory/low-stock`)
- ✅ Adjust stock (IN/OUT) (`POST /api/inventory/adjust`)
- ✅ View inventory history (`GET /api/inventory/:productId/history`)
- ✅ Access all stores' inventory

### POS Operations
- ✅ Access POS interface (`/pos`)
- ✅ View products with availability (`GET /api/pos/products`)
- ✅ Search products (`GET /api/pos/products/search`)
- ✅ Manage cart (`GET/POST/PUT/DELETE /api/pos/cart/*`)
- ✅ Process checkout (`POST /api/pos/checkout`)
- ✅ View receipts (`GET /api/receipts/:orderId`)

### Purchase Orders
- ✅ Create purchase orders (`POST /api/purchase-orders`)
- ✅ View all purchase orders (`GET /api/purchase-orders`)
- ✅ View purchase order details (`GET /api/purchase-orders/:id`)
- ✅ Receive purchase orders (`PUT /api/purchase-orders/:id/receive`)
- ✅ Cancel purchase orders (`PUT /api/purchase-orders/:id/cancel`)
- ✅ Access all stores' purchase orders

### Reports & Analytics
- ✅ View sales reports (`GET /api/reports/sales`)
- ✅ View inventory reports (`GET /api/reports/inventory`)
- ✅ View transaction history (`GET /api/reports/transactions`)
- ✅ View payment reports (`GET /api/reports/payments`)
- ✅ Access dashboard with all metrics
- ✅ View reports for all stores

### Alerts
- ✅ View expiring items (`GET /api/alerts/expiring`)
- ✅ View inventory alerts (`GET /api/alerts/inventory`)

### Audit & Security
- ✅ View audit logs (`GET /api/audit-logs`)
- ✅ Access all audit trail data
- ✅ System-wide visibility

### Frontend Access
- ✅ All pages accessible
- ✅ Full dashboard with all metrics
- ✅ User management page
- ✅ All navigation menu items

---

## 👔 MANAGER

**Store-level management with limited user management.**

### User Management
- ❌ Cannot create users
- ✅ View users (`GET /api/users`)
- ✅ View user details (`GET /api/users/:id`)
- ❌ Cannot update users
- ❌ Cannot delete users
- ✅ Access only assigned store

### Products & Categories
- ✅ Create products (`POST /api/products`)
- ✅ View all products (`GET /api/products`)
- ✅ Update products (`PUT /api/products/:id`)
- ❌ Cannot delete products
- ✅ Create categories (`POST /api/categories`)
- ✅ View all categories (`GET /api/categories`)
- ✅ Update categories (`PUT /api/categories/:id`)
- ❌ Cannot delete categories

### Inventory Management
- ✅ Create inventory entries (`POST /api/inventory`)
- ✅ View store inventory (`GET /api/inventory`)
- ✅ View low stock items (`GET /api/inventory/low-stock`)
- ✅ Adjust stock (IN/OUT) (`POST /api/inventory/adjust`)
- ✅ View inventory history (`GET /api/inventory/:productId/history`)
- ✅ Access only assigned store

### POS Operations
- ✅ Access POS interface (`/pos`)
- ✅ View products with availability (`GET /api/pos/products`)
- ✅ Search products (`GET /api/pos/products/search`)
- ✅ Manage cart (`GET/POST/PUT/DELETE /api/pos/cart/*`)
- ✅ Process checkout (`POST /api/pos/checkout`)
- ✅ View receipts (`GET /api/receipts/:orderId`)

### Purchase Orders
- ✅ Create purchase orders (`POST /api/purchase-orders`)
- ✅ View store purchase orders (`GET /api/purchase-orders`)
- ✅ View purchase order details (`GET /api/purchase-orders/:id`)
- ✅ Receive purchase orders (`PUT /api/purchase-orders/:id/receive`)
- ✅ Cancel purchase orders (`PUT /api/purchase-orders/:id/cancel`)
- ✅ Access only assigned store
- ⚠️ **Note**: Backend allows any authenticated user, but frontend restricts to ADMIN/MANAGER/WAREHOUSE

### Reports & Analytics
- ✅ View sales reports (`GET /api/reports/sales`)
- ✅ View inventory reports (`GET /api/reports/inventory`)
- ✅ View transaction history (`GET /api/reports/transactions`)
- ✅ View payment reports (`GET /api/reports/payments`)
- ✅ Access dashboard with store metrics
- ✅ View reports for assigned store only

### Alerts
- ✅ View expiring items (`GET /api/alerts/expiring`)
- ✅ View inventory alerts (`GET /api/alerts/inventory`)

### Audit & Security
- ❌ Cannot view audit logs
- ✅ Store-scoped operations only

### Frontend Access
- ✅ Homepage
- ✅ Dashboard (store-level)
- ✅ POS
- ✅ Products (create/edit, no delete)
- ✅ Categories (create/edit, no delete)
- ✅ Inventory
- ✅ Reports (store-level)
- ✅ Purchase Orders
- ❌ User Management (not accessible)

---

## 💰 CASHIER

**POS operations and checkout only.**

### User Management
- ❌ No access to user management

### Products & Categories
- ✅ View products (read-only) (`GET /api/products`)
- ✅ View categories (read-only) (`GET /api/categories`)
- ❌ Cannot create, update, or delete

### Inventory Management
- ✅ View inventory (read-only) (`GET /api/inventory`)
- ✅ View low stock items (`GET /api/inventory/low-stock`)
- ❌ Cannot create inventory entries
- ❌ Cannot adjust stock

### POS Operations
- ✅ Access POS interface (`/pos`)
- ✅ View products with availability (`GET /api/pos/products`)
- ✅ Search products (`GET /api/pos/products/search`)
- ✅ Manage cart (`GET/POST/PUT/DELETE /api/pos/cart/*`)
- ✅ Process checkout (`POST /api/pos/checkout`)
- ✅ View receipts (`GET /api/receipts/:orderId`)
- ✅ Access only assigned store

### Purchase Orders
- ❌ No access to purchase orders

### Reports & Analytics
- ❌ No access to reports
- ✅ Basic dashboard (limited metrics)

### Alerts
- ✅ View expiring items (`GET /api/alerts/expiring`)
- ✅ View inventory alerts (`GET /api/alerts/inventory`)

### Audit & Security
- ❌ Cannot view audit logs
- ✅ Store-scoped operations only

### Frontend Access
- ✅ Homepage
- ✅ Dashboard (limited view)
- ✅ POS (full access)
- ❌ Products (not accessible)
- ❌ Categories (not accessible)
- ❌ Inventory (not accessible)
- ❌ Reports (not accessible)
- ❌ Purchase Orders (not accessible)
- ❌ User Management (not accessible)

---

## 📦 WAREHOUSE

**Inventory and purchase order management.**

### User Management
- ❌ No access to user management

### Products & Categories
- ✅ View products (read-only) (`GET /api/products`)
- ✅ View categories (read-only) (`GET /api/categories`)
- ❌ Cannot create, update, or delete

### Inventory Management
- ✅ Create inventory entries (`POST /api/inventory`)
- ✅ View store inventory (`GET /api/inventory`)
- ✅ View low stock items (`GET /api/inventory/low-stock`)
- ✅ Adjust stock (IN/OUT) (`POST /api/inventory/adjust`)
- ✅ View inventory history (`GET /api/inventory/:productId/history`)
- ✅ Access only assigned store

### POS Operations
- ❌ No access to POS operations

### Purchase Orders
- ✅ Create purchase orders (`POST /api/purchase-orders`)
- ✅ View store purchase orders (`GET /api/purchase-orders`)
- ✅ View purchase order details (`GET /api/purchase-orders/:id`)
- ✅ Receive purchase orders (`PUT /api/purchase-orders/:id/receive`)
- ❌ Cannot cancel purchase orders
- ✅ Access only assigned store

### Reports & Analytics
- ✅ View inventory reports (`GET /api/reports/inventory`)
- ❌ No access to sales reports
- ❌ No access to transaction history
- ❌ No access to payment reports
- ✅ Dashboard with inventory metrics

### Alerts
- ✅ View expiring items (`GET /api/alerts/expiring`)
- ✅ View inventory alerts (`GET /api/alerts/inventory`)

### Audit & Security
- ❌ Cannot view audit logs
- ✅ Store-scoped operations only

### Frontend Access
- ✅ Homepage
- ✅ Dashboard (inventory-focused)
- ❌ POS (not accessible)
- ❌ Products (not accessible)
- ❌ Categories (not accessible)
- ✅ Inventory (full access)
- ❌ Reports (limited - inventory only)
- ✅ Purchase Orders (create/receive, no cancel)
- ❌ User Management (not accessible)

---

## 📊 ACCOUNTANT

**Financial reporting and analytics only.**

### User Management
- ❌ No access to user management

### Products & Categories
- ✅ View products (read-only) (`GET /api/products`)
- ✅ View categories (read-only) (`GET /api/categories`)
- ❌ Cannot create, update, or delete

### Inventory Management
- ✅ View inventory (read-only) (`GET /api/inventory`)
- ✅ View low stock items (`GET /api/inventory/low-stock`)
- ❌ Cannot create inventory entries
- ❌ Cannot adjust stock

### POS Operations
- ❌ No access to POS operations

### Purchase Orders
- ❌ No access to purchase orders

### Reports & Analytics
- ✅ View sales reports (`GET /api/reports/sales`)
- ✅ View inventory reports (`GET /api/reports/inventory`)
- ✅ View transaction history (`GET /api/reports/transactions`)
- ✅ View payment reports (`GET /api/reports/payments`)
- ✅ Access dashboard with financial metrics
- ✅ View reports for assigned store only

### Alerts
- ✅ View expiring items (`GET /api/alerts/expiring`)
- ✅ View inventory alerts (`GET /api/alerts/inventory`)

### Audit & Security
- ❌ Cannot view audit logs
- ✅ Store-scoped operations only

### Frontend Access
- ✅ Homepage
- ✅ Dashboard (financial-focused)
- ❌ POS (not accessible)
- ❌ Products (not accessible)
- ❌ Categories (not accessible)
- ❌ Inventory (not accessible)
- ✅ Reports (full access)
- ❌ Purchase Orders (not accessible)
- ❌ User Management (not accessible)

---

## 📋 Permission Summary Table

| Feature | ADMIN | MANAGER | CASHIER | WAREHOUSE | ACCOUNTANT |
|---------|-------|---------|---------|-----------|------------|
| **User Management** |
| Create Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Products & Categories** |
| Create Products | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Products | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Products | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Products | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Categories | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Categories | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Categories | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Categories | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Inventory** |
| Create Inventory | ✅ | ✅ | ❌ | ✅ | ❌ |
| Adjust Stock | ✅ | ✅ | ❌ | ✅ | ❌ |
| View Inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| View History | ✅ | ✅ | ❌ | ✅ | ❌ |
| **POS Operations** |
| Access POS | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Cart | ✅ | ✅ | ✅ | ❌ | ❌ |
| Process Checkout | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Receipts | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Purchase Orders** |
| Create PO | ✅ | ✅ | ❌ | ✅ | ❌ |
| View PO | ✅ | ✅ | ❌ | ✅ | ❌ |
| Receive PO | ✅ | ✅ | ❌ | ✅ | ❌ |
| Cancel PO | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reports** |
| Sales Reports | ✅ | ✅ | ❌ | ❌ | ✅ |
| Inventory Reports | ✅ | ✅ | ❌ | ✅ | ✅ |
| Transaction History | ✅ | ✅ | ❌ | ❌ | ✅ |
| Payment Reports | ✅ | ✅ | ❌ | ❌ | ✅ |
| **System** |
| Audit Logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| All Stores Access | ✅ | ❌ | ❌ | ❌ | ❌ |
| Store-Scoped Only | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## 🔒 Store Scoping Rules

### Multi-Store Access
- **ADMIN**: Can access all stores (no restrictions)
- **All Other Roles**: Limited to their assigned store only

### Store Validation
- All operations (except ADMIN) are automatically scoped to the user's assigned store
- Cross-store data access is prevented by middleware
- Store ID is automatically injected from user's profile

---

## 🛡️ Security Notes

1. **Authentication Required**: All endpoints (except public reads) require JWT authentication
2. **Role-Based Authorization**: Each endpoint validates user role before allowing access
3. **Store Scoping**: Non-admin users can only access data from their assigned store
4. **Audit Logging**: All sensitive operations are logged (ADMIN can view audit logs)
5. **Rate Limiting**: Different rate limits apply based on endpoint type
6. **Input Validation**: All inputs are validated before processing

---

## 📝 Notes

- **Read-Only Access**: Some roles have read-only access to certain features
- **Store Assignment**: Users must be assigned to a store (except ADMIN)
- **Role Hierarchy**: ADMIN has implicit access to all features
- **Frontend Routing**: Frontend routes are protected by role-based routing
- **API-Level Protection**: Backend enforces permissions even if frontend is bypassed

---

**Last Updated**: Based on current codebase structure

