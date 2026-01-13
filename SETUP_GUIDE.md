# Complete Setup Guide - Step by Step

## 🎯 Quick Overview

This guide will help you get the POS system running on your localhost browser in **under 5 minutes**.

---

## Method 1: Docker Setup (Recommended - Easiest)

### Prerequisites
- Docker Desktop installed and running
- Git (if cloning from repository)

### Step-by-Step Instructions

#### 1. Navigate to Project Directory
```bash
cd Z:\pos
```

#### 2. Create Backend Environment File

Create `backend/.env` file with this content:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0
JWT_SECRET=my-super-secret-jwt-key-that-is-at-least-32-characters-long
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
SLOW_QUERY_THRESHOLD=1000
```

**Windows PowerShell:**
```powershell
cd backend
@"
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0
JWT_SECRET=my-super-secret-jwt-key-that-is-at-least-32-characters-long
ALLOWED_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
SLOW_QUERY_THRESHOLD=1000
"@ | Out-File -FilePath .env -Encoding utf8
cd ..
```

#### 3. Create Frontend Environment File

Create `frontend/.env` file with this content:

```env
VITE_API_URL=http://localhost:5000/api
NODE_ENV=development
```

**Windows PowerShell:**
```powershell
cd frontend
@"
VITE_API_URL=http://localhost:5000/api
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
cd ..
```

#### 4. Start All Services

```bash
docker compose up -d
```

This will:
- Download MongoDB image (first time only)
- Build backend Docker image
- Build frontend Docker image
- Start all three services

#### 5. Wait for Services to Start

Watch the logs:
```bash
docker compose logs -f
```

Wait until you see:
- ✅ MongoDB: `Waiting for connections`
- ✅ Backend: `Server running on port 5000`
- ✅ Frontend: Nginx started

**This takes about 1-2 minutes on first run.**

#### 6. Create Your First User

You need to create a user to login. Here's the easiest way:

**Option A: Using MongoDB Shell (Docker)**
```bash
# Access MongoDB
docker exec -it pos-mongodb mongosh grocery_pos

# In MongoDB shell, run:
db.users.insertOne({
  name: "Admin User",
  email: "admin@test.com",
  passwordHash: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  role: "ADMIN",
  isActive: true
})
```

**The password hash above is for password: `admin123`**

**Option B: Using Node.js Script**

Create `backend/scripts/createUser.js`:
```javascript
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0');
    
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash,
      role: 'ADMIN',
      isActive: true
    });
    
    await admin.save();
    console.log('✅ Admin user created!');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
```

Run it:
```bash
cd backend
node scripts/createUser.js
```

#### 7. Open in Browser

**Frontend Application:**
```
http://localhost:3000
```

**Backend Health Check:**
```
http://localhost:5000/api/health
```

#### 8. Login

- Email: `admin@test.com`
- Password: `admin123`

You should now see the dashboard!

---

## Method 2: Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+ installed
- MongoDB 7.0+ installed and running
- Two terminal windows

### Step-by-Step Instructions

#### 1. Start MongoDB

Make sure MongoDB is running:
```bash
# Check if running
mongosh

# If not running, start it (Windows):
# Usually runs as a service, or:
mongod --dbpath "C:\data\db"
```

#### 2. Setup Backend (Terminal 1)

```bash
cd Z:\pos\backend

# Install dependencies
npm install

# Create .env file (same as Docker, but use):
# MONGODB_URI=mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0

# Start backend
npm run dev
```

Backend will start on: **http://localhost:5000**

#### 3. Setup Frontend (Terminal 2)

```bash
cd Z:\pos\frontend

# Install dependencies
npm install

# Create .env file:
# VITE_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

Frontend will start on: **http://localhost:5173** (check terminal for actual port)

#### 4. Create User

Use the same method as Docker (Option B - Node.js script)

#### 5. Open Browser

Go to the URL shown in the frontend terminal (usually http://localhost:5173)

---

## 🎨 What You'll See in the Browser

### Login Page
- Clean login form
- Enter email and password
- Click "Login"

### Dashboard (After Login)
- **ADMIN Role**: Full dashboard with:
  - Sales metrics cards
  - Sales trend chart
  - Payments breakdown chart
  - Inventory summary
  - Alerts panel

### Navigation Menu
- **Dashboard**: Overview and metrics
- **POS**: Point of sale interface
- **Inventory**: Stock management
- **Reports**: Analytics and reports
- **Purchase Orders**: Supplier orders
- **Users**: User management (ADMIN only)

### POS Interface
- Product search bar (supports barcode scanning)
- Product grid with availability
- Shopping cart sidebar
- Checkout with payment options
- Receipt generation

---

## 🔍 Verify Everything Works

### 1. Check Backend Health
Open: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-...",
  "service": "Grocery POS API",
  "version": "1.0.0"
}
```

### 2. Check Frontend
Open: http://localhost:3000 (Docker) or http://localhost:5173 (Manual)

You should see the login page.

### 3. Test Login
- Enter credentials
- Should redirect to dashboard
- No errors in browser console

### 4. Test POS
- Navigate to POS page
- Search for products
- Add items to cart
- Complete checkout

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:**
1. Check backend is running: http://localhost:5000/api/health
2. Verify `VITE_API_URL` in frontend/.env
3. Check CORS settings in backend/.env (`ALLOWED_ORIGINS`)

### Issue: "MongoDB connection failed"
**Solution:**
1. Verify MongoDB Atlas connection string is correct in backend/.env
2. Check your IP address is whitelisted in MongoDB Atlas Network Access
3. For local MongoDB: Verify MongoDB is running: `mongosh`
4. For Docker: `docker compose logs mongodb`

### Issue: "Port already in use"
**Solution:**
1. Find what's using the port:
   ```powershell
   netstat -ano | findstr :5000
   ```
2. Stop that process or change port in docker-compose.yml

### Issue: "Login fails"
**Solution:**
1. Verify user exists in database
2. Check password hash is correct
3. Verify user `isActive: true`
4. Check backend logs for errors

### Issue: "Docker build fails"
**Solution:**
1. Ensure Docker Desktop is running
2. Check disk space
3. Try: `docker compose build --no-cache`

---

## 📊 Monitoring Services

### View Logs (Docker)
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Check Service Status
```bash
docker compose ps
```

All services should show "Up" and "healthy"

### Stop Services
```bash
# Stop (keeps data)
docker compose down

# Stop and remove data
docker compose down -v
```

---

## 🎯 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:5000 | REST API |
| Health Check | http://localhost:5000/api/health | Service status |
| Metrics | http://localhost:5000/api/health/metrics | System metrics |
| MongoDB | localhost:27017 | Database |

---

## ✅ Success Checklist

- [ ] All Docker containers running (or services started manually)
- [ ] Backend health check returns OK
- [ ] Frontend loads in browser
- [ ] Can login with created user
- [ ] Dashboard displays correctly
- [ ] POS page loads products
- [ ] Can add items to cart
- [ ] Checkout works

Once all checked, you're ready to use the system! 🎉

