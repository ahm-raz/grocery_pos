# Grocery-Focused Micro-Fulfillment POS System

A production-ready Point of Sale (POS) system designed specifically for grocery micro-fulfillment operations, built with the MERN stack (MongoDB, Express.js, React, Node.js) and Tailwind CSS.

## 🚀 Quick Start

Get the system running locally:

```bash
# Clone the repository
git clone <repository-url>
cd pos

# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env and set JWT_SECRET, MONGODB_URI (MongoDB Atlas), ALLOWED_ORIGINS
npm run dev

# Frontend Setup (in a new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:5000/api
npm run dev
```

The system will be available at:
- **Frontend**: http://localhost:5173 (Vite default)
- **Backend API**: http://localhost:5000

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB 7.0+)
- npm or yarn

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: MongoDB (local instance)
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Security**: Rate limiting, audit logging, brute force protection

### Key Features
- **Multi-Store Support**: Store-scoped operations with role-based access
- **Multi-Cashier POS**: Concurrent cart management per cashier
- **Advanced Inventory**: Batch-level tracking with FIFO/FILO, expiry management
- **Payment Processing**: Multiple payment methods (Cash, Card, E-Wallet) with split payments
- **Receipt Generation**: Printable HTML receipts
- **Real-Time Reporting**: Sales, inventory, and payment analytics with role-based dashboards
- **Audit Logging**: Comprehensive audit trail for all sensitive operations
- **Security Hardening**: Rate limiting, brute force protection, integrity guards

## 🔧 Setup Instructions

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration:
# - JWT_SECRET (min 32 characters)
# - MONGODB_URI (MongoDB Atlas connection string)
# - ALLOWED_ORIGINS (comma-separated, e.g., http://localhost:5173)

# Ensure MongoDB is running on localhost:27017

# Start backend server
npm run dev  # Development mode with auto-reload
# or
npm start    # Production mode
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Build for production
npm run build
# Serve the dist/ folder with a static file server
```

## 📦 Data Insertion & Seeding

### Quick Start: Seed Script

The fastest way to populate your database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- ✅ 1 Store (STORE001)
- ✅ 10 Categories (Fruits, Vegetables, Dairy, Meat, Beverages, Snacks, Bakery, Frozen, Canned, Cleaning)
- ✅ 30+ Products across all categories
- ✅ Inventory entries with batches for all products

**Note:** The seed script will clear existing categories, products, and inventory before inserting new data.

### Manual Data Insertion

For detailed instructions on manually inserting data via API or MongoDB, see:
- **[QUICK_DATA_INSERT.md](./QUICK_DATA_INSERT.md)** - Quick reference guide
- **[DATA_INSERTION_GUIDE.md](./DATA_INSERTION_GUIDE.md)** - Comprehensive guide with examples

### Data Insertion Order

1. **Categories** → Create product categories first
2. **Products** → Create products (requires Category IDs)
3. **Inventory** → Create inventory entries (requires Product and Store IDs)
4. **Stock Adjustment** → Add stock using the inventory adjustment endpoint

## 🔐 Environment Configuration

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/production) | Yes | - |
| `PORT` | Backend server port | No | 5000 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars in production) | Yes | - |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | No | - |
| `LOG_LEVEL` | Logging level (DEBUG/INFO/WARN/ERROR/CRITICAL) | No | INFO |
| `SLOW_QUERY_THRESHOLD` | Slow query threshold in milliseconds | No | 1000 |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | http://localhost:5000/api |
| `NODE_ENV` | Environment | No | development |

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, all stores, user management, audit logs |
| **MANAGER** | Store-level sales, inventory, purchase orders, limited user management |
| **CASHIER** | POS operations, checkout, current cart |
| **ACCOUNTANT** | Financial reports, payments overview, sales analytics |
| **WAREHOUSE** | Inventory management, batch tracking, expiry alerts, stock adjustments |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product (ADMIN/MANAGER)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (ADMIN/MANAGER)
- `DELETE /api/products/:id` - Delete product (ADMIN)

### Inventory
- `GET /api/inventory` - List inventory
- `POST /api/inventory` - Create inventory entry
- `POST /api/inventory/adjust` - Adjust stock (with batch tracking)
- `GET /api/inventory/:productId/history` - Get inventory history
- `GET /api/inventory/low-stock` - Get low stock items

### POS Operations
- `GET /api/pos/products` - Get products with availability
- `GET /api/pos/products/search` - Search products
- `GET /api/pos/cart` - Get current cart
- `POST /api/pos/cart/add` - Add item to cart
- `PUT /api/pos/cart/update` - Update cart item
- `DELETE /api/pos/cart/remove` - Remove item from cart
- `POST /api/pos/checkout` - Complete checkout with payment

### Reports
- `GET /api/reports/sales` - Sales summary (date range, store-scoped)
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/transactions` - Transaction history
- `GET /api/reports/payments` - Payment breakdown by method

### Audit Logs (ADMIN only)
- `GET /api/audit-logs` - Query audit logs (filterable, paginated)

### Health & Metrics
- `GET /api/health` - Health check
- `GET /api/health/metrics` - System metrics

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with short-lived tokens (1 hour in production)
- Role-based access control (RBAC) enforced on all endpoints
- Store-scoped operations prevent cross-store data access

### Rate Limiting
- Auth endpoints: 5 attempts per 15 minutes
- POS endpoints: 60 requests per minute
- Reports: 20 requests per 5 minutes
- General API: 100 requests per minute

### Brute Force Protection
- Account locking after 5 failed login attempts
- 15-minute cooldown period
- Automatic unlock after cooldown

### Audit Logging
- All sensitive operations logged (login, inventory, checkout, payments, user management)
- Non-blocking audit logging (failures don't crash core operations)
- Queryable audit trail with filtering and pagination

### Integrity Guards
- Cart subtotal validation (backend recalculates)
- Payment total validation
- Inventory batch total verification
- All violations logged with CRITICAL severity

## 📊 Database Schema

### Core Models
- **User**: Authentication, roles, store assignment
- **Store**: Multi-store support
- **Product**: SKU, barcode, pricing, category
- **Inventory**: Batch-level stock with expiry tracking
- **Cart**: User-specific, store-scoped shopping carts
- **Order**: Completed sales with payment details
- **InventoryTransaction**: Audit trail for all stock movements
- **PurchaseOrder**: Supplier orders with batch tracking
- **AuditLog**: System-wide audit trail

## 🚢 Production Deployment

### Backend Deployment

1. **Install Production Dependencies**
   ```bash
   cd backend
   npm ci --only=production
   ```

2. **Configure Environment**
   - Set `NODE_ENV=production` in `.env`
   - Set strong `JWT_SECRET` (minimum 32 characters)
   - Configure production `MONGODB_URI`
   - Set restricted `ALLOWED_ORIGINS` (comma-separated)

3. **Start Server**
   ```bash
   NODE_ENV=production npm start
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Serve Static Files**
   - Serve the `dist/` folder with nginx, Apache, or similar static file server
   - Configure reverse proxy to backend API if needed
   - Set proper CORS headers

3. **Verify Deployment**
   ```bash
   curl http://your-backend-url/api/health
   ```

## 🔍 Monitoring & Observability

### Logging
- Structured JSON logs in production
- Request ID tracking for traceability
- Slow query detection (configurable threshold)
- Log levels: DEBUG, INFO, WARN, ERROR, CRITICAL

### Metrics
- System metrics endpoint: `/api/health/metrics`
- Memory usage, CPU load, uptime
- Process information

### Health Checks
- Backend: `GET /api/health`
- Frontend: Health check via backend API

## 📝 Operational Notes

### Backups
- Backup strategy: Regular MongoDB dumps using `mongodump`
- Audit logs should be archived periodically
- Store backups in secure, off-site location

### Scaling
- Backend: Stateless, can scale horizontally
- Frontend: Static assets, can use CDN
- MongoDB: Use replica sets for high availability

### Troubleshooting

**Backend won't start:**
- Check MongoDB connection (verify MongoDB Atlas connection string is correct)
- Verify all required environment variables in `.env`
- Check console logs for error messages
- Verify JWT_SECRET is at least 32 characters

**Frontend can't connect to backend:**
- Verify `VITE_API_URL` in frontend `.env` matches backend URL
- Check CORS settings in backend (verify ALLOWED_ORIGINS includes frontend URL)
- Verify backend is running on the expected port
- Check browser console for CORS errors

**Database connection issues:**
- Verify MongoDB Atlas connection string is correct in `backend/.env`
- Check `MONGODB_URI` format: `mongodb+srv://username:password@cluster.mongodb.net/database`
- Ensure MongoDB Atlas network access allows your IP address
- Check MongoDB Atlas logs for connection errors

## 🛡️ Security Checklist

✅ No dev-only tools enabled in production  
✅ No debug endpoints exposed  
✅ No hardcoded credentials  
✅ All services restart safely  
✅ System recovers gracefully after crash  
✅ Rate limiting active  
✅ Audit logging operational  
✅ Brute force protection enabled  
✅ Integrity guards active  
✅ Environment variables validated on startup  

## 📚 API Documentation

### Sample Workflows

**1. Login and Get Products**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cashier@example.com","password":"password"}'

# Get products (use token from login)
curl http://localhost:5000/api/pos/products \
  -H "Authorization: Bearer <token>"
```

**2. Add to Cart and Checkout**
```bash
# Add item to cart
curl -X POST http://localhost:5000/api/pos/cart/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"storeId":"<storeId>","productId":"<productId>","quantity":2}'

# Checkout
curl -X POST http://localhost:5000/api/pos/checkout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId":"<storeId>",
    "payments":[{"method":"CASH","amount":50.00}],
    "tax":0
  }'
```

## 🎯 Known Limitations & Extension Points

### Current Limitations
- Single MongoDB instance (no replica set)
- No real-time updates (polling-based)
- Receipt generation is HTML-only (no PDF)
- No email notifications
- No SMS alerts

### Extension Points
- Add WebSocket support for real-time updates
- Implement PDF receipt generation
- Add email/SMS notification system
- Integrate with payment gateways
- Add barcode scanner hardware support
- Implement advanced analytics with time-series data

## 📄 License

[Your License Here]

## 👨‍💻 Development

### Project Structure

The project follows a **modular, feature-based architecture** for both backend and frontend, promoting scalability and maintainability.

#### Backend Structure (Modular)

```
backend/
├── src/
│   ├── config/              # Configuration (database, env validation)
│   ├── models/              # Mongoose models (centralized)
│   │   ├── User.js
│   │   ├── Store.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Inventory.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── InventoryTransaction.js
│   │   ├── PurchaseOrder.js
│   │   └── AuditLog.js
│   ├── modules/             # Feature-based modules
│   │   ├── auth/            # Authentication (controller, service, routes)
│   │   ├── users/           # User management
│   │   ├── stores/          # Store management
│   │   ├── products/        # Products (CRUD + POS endpoints)
│   │   ├── categories/      # Categories
│   │   ├── inventory/       # Inventory (adjustments, batch tracking)
│   │   ├── cart/            # POS cart operations
│   │   ├── orders/          # Order finalization
│   │   ├── reports/         # Analytics & reporting
│   │   ├── purchase-orders/ # Purchase order management
│   │   ├── receipts/        # Receipt generation
│   │   ├── alerts/          # Low-stock & expiry alerts
│   │   ├── audit/           # Audit logging
│   │   └── health/          # Health checks
│   ├── middleware/          # Express middleware (auth, rate limiting, etc.)
│   ├── utils/               # Shared utilities
│   └── server.js            # Entry point
├── scripts/                  # Utility scripts (seed, createUser)
└── package.json
```

**Backend Module Pattern:**
Each module contains:
- `*.controller.js` - Request/response handling
- `*.service.js` - Business logic
- `*.routes.js` - Route definitions

#### Frontend Structure (Feature-Based)

```
frontend/
├── src/
│   ├── api/                 # API service layer (Axios-based)
│   │   ├── axios.js        # Axios instance with interceptors
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── cart.js
│   │   ├── inventory.js
│   │   ├── reports.js
│   │   ├── purchaseOrders.js
│   │   ├── alerts.js
│   │   ├── receipts.js
│   │   └── index.js        # Barrel export
│   ├── features/           # Feature-based organization
│   │   ├── auth/
│   │   │   ├── components/Login.jsx
│   │   │   └── services/authService.js
│   │   ├── homepage/
│   │   │   └── components/Homepage.jsx
│   │   ├── dashboard/
│   │   │   └── components/Dashboard.jsx
│   │   ├── pos/
│   │   │   └── components/POS.jsx
│   │   ├── products/
│   │   │   └── components/Products.jsx
│   │   ├── categories/
│   │   │   └── components/Categories.jsx
│   │   ├── inventory/
│   │   │   └── components/Inventory.jsx
│   │   ├── reports/
│   │   │   └── components/Reports.jsx
│   │   └── purchase-orders/
│   │       └── components/PurchaseOrders.jsx
│   ├── components/
│   │   └── common/         # Shared UI components
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Loading.jsx
│   │       ├── Layout.jsx
│   │       ├── ProtectedRoute.jsx
│   │       ├── PinLockScreen.jsx
│   │       ├── AnimatedRoute.jsx
│   │       ├── AnimatedModal.jsx
│   │       ├── AnimatedCard.jsx
│   │       ├── MetricCard.jsx
│   │       ├── PaymentModal.jsx
│   │       ├── ReceiptModal.jsx
│   │       ├── SalesChart.jsx
│   │       ├── PaymentsChart.jsx
│   │       └── AlertsPanel.jsx
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── PinLockContext.jsx
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   │   ├── formatCurrency.js
│   │   ├── formatDate.js
│   │   └── roles.js
│   ├── assets/             # Static assets
│   ├── styles/             # Global styles
│   └── App.jsx             # Main component
└── package.json
```

**Frontend Import Strategy:**
- **Absolute imports** are configured via `vite.config.js`
- Use `@/` prefix for root-relative imports (e.g., `@/api/axios.js`)
- Use `@features/`, `@components/`, `@context/`, `@utils/` for feature-specific imports
- Example: `import { useAuth } from '@context/AuthContext.jsx'`

---

**System is production-deployable and operationally ready.**