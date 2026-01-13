# Quick Start Guide - Running the POS System Locally

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB 7.0+)
- Two terminal windows

---

## Step 1: MongoDB Setup

**Using MongoDB Atlas (Recommended):**
- Use your MongoDB Atlas connection string in the `.env` file
- Ensure your IP address is whitelisted in MongoDB Atlas Network Access

**Using Local MongoDB:**
```bash
# Check if MongoDB is running
mongosh

# If it connects, MongoDB is running. If not, start it.
# Windows: Usually runs as a service, check Services
# Or start manually: mongod
```

---

## Step 2: Setup Backend

**Terminal 1:**
```bash
cd backend

# Install dependencies (first time only)
npm install

# Create .env file
# Copy .env.example to .env and edit:
# - MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grocery_pos
# - JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
# - ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Start backend server
npm run dev
```

Wait for: `Server running on port 5000`

---

## Step 3: Setup Frontend

**Terminal 2 (new terminal):**
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Create .env file
# Set: VITE_API_URL=http://localhost:5000/api

# Start frontend server
npm run dev
```

Note the URL shown (usually http://localhost:5173)

---

## Step 4: Create Admin User

**Terminal 3 (new terminal):**
```bash
cd backend
node scripts/createUser.js
```

This creates:
- Email: `admin@test.com`
- Password: `admin123`
- Role: `ADMIN`

---

## Step 5: Open in Browser

1. Open: http://localhost:5173 (or port shown in frontend terminal)
2. Login with:
   - Email: `admin@test.com`
   - Password: `admin123`

---

## ✅ Verify Setup

1. **Backend Health**: http://localhost:5000/api/health
   - Should return: `{"status":"OK",...}`

2. **Frontend**: http://localhost:5173
   - Should show login page

3. **Login**: Enter credentials → Should redirect to dashboard

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB Atlas connection string is correct in `backend/.env`
- Check `MONGODB_URI` format: `mongodb+srv://username:password@cluster.mongodb.net/grocery_pos`
- Ensure your IP address is whitelisted in MongoDB Atlas Network Access
- For local MongoDB: Verify MongoDB is running: `mongosh`

### Port Already in Use
```powershell
# Find what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

### Frontend Can't Connect to Backend
1. Verify backend is running: http://localhost:5000/api/health
2. Check `VITE_API_URL` in `frontend/.env`
3. Check `ALLOWED_ORIGINS` in `backend/.env` includes frontend URL

---

## 📝 Quick Commands Reference

```bash
# Backend
cd backend && npm install    # First time
cd backend && npm run dev     # Start backend

# Frontend
cd frontend && npm install    # First time
cd frontend && npm run dev    # Start frontend

# Create User
cd backend && node scripts/createUser.js
```

---

## 🎯 What's Next?

1. **Seed Sample Data**: `cd backend && npm run seed`
2. **Explore Dashboard**: After login, view metrics and charts
3. **Test POS**: Navigate to POS page and try checkout
4. **Manage Inventory**: Add products and adjust stock

For detailed setup instructions, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)

### Step 1: Start MongoDB

Make sure MongoDB is running on your machine:
```bash
# Windows (if installed as service, it should auto-start)
# Or start manually:
mongod

# Verify it's running:
mongosh
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (same content as Docker option above, but use):
# MONGODB_URI=mongodb://localhost:27017/grocery_pos

# Start backend
npm run dev
```

Backend will run on: http://localhost:5000

### Step 3: Setup Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with:
# VITE_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

Frontend will run on: http://localhost:5173 (Vite default) or http://localhost:3000

### Step 4: Open in Browser

- **Frontend**: http://localhost:5173 (or check terminal for actual port)
- **Backend**: http://localhost:5000/api/health

---

## What You'll See

### 1. Login Page
- Enter your email and password
- After login, you'll be redirected based on your role

### 2. Dashboard (Role-Based)
- **ADMIN**: Full dashboard with all metrics, charts, and controls
- **MANAGER**: Store-level dashboard
- **CASHIER**: Simple POS-focused view
- **ACCOUNTANT**: Financial dashboard
- **WAREHOUSE**: Inventory-focused dashboard

### 3. POS Page
- Product search (by SKU, barcode, or name)
- Add items to cart
- Real-time stock validation
- Checkout with payment options
- Receipt generation

### 4. Other Pages
- **Inventory**: View and manage inventory with batch tracking
- **Reports**: Sales, inventory, and transaction reports
- **Purchase Orders**: Manage supplier orders
- **Users**: User management (ADMIN only)

---

## Troubleshooting

### Services Won't Start

**Check if ports are in use:**
```bash
# Windows PowerShell
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :27017

# If ports are busy, stop those services or change ports in docker-compose.yml
```

### Frontend Can't Connect to Backend

1. Check backend is running: http://localhost:5000/api/health
2. Verify `VITE_API_URL` in frontend/.env matches backend URL
3. Check browser console for CORS errors
4. Verify `ALLOWED_ORIGINS` in backend/.env includes frontend URL

### MongoDB Connection Issues

**Docker:**
```bash
# Check MongoDB container
docker compose ps
docker compose logs mongodb

# Restart MongoDB
docker compose restart mongodb
```

**Manual:**
- Verify MongoDB is running: `mongosh`
- Check connection string in backend/.env

### Can't Login

1. Verify user exists in database
2. Check password hash is correct (use bcrypt)
3. Check user `isActive` is `true`
4. Check backend logs for authentication errors

### View Logs

**Docker:**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

**Manual:**
- Backend logs appear in terminal
- Frontend logs appear in terminal and browser console

---

## Quick Test

Once everything is running:

1. **Health Check**: http://localhost:5000/api/health
   - Should return: `{"status":"OK",...}`

2. **Login**: http://localhost:3000 (or your frontend port)
   - Enter credentials
   - Should redirect to dashboard

3. **POS Test**:
   - Go to POS page
   - Search for products
   - Add items to cart
   - Complete checkout

---

## Stop Services

**Docker:**
```bash
# Stop all services
docker compose down

# Stop and remove volumes (clears database)
docker compose down -v
```

**Manual:**
- Press `Ctrl+C` in each terminal running the services

---

## Next Steps

1. Create initial data (stores, products, inventory) via API or directly in MongoDB
2. Create users for different roles
3. Test POS workflow
4. Explore reports and dashboards

For detailed API documentation, see README.md

