# Complete Setup Guide - Step by Step

## 🎯 Quick Overview

This guide will help you get the POS system running on your localhost browser in **under 5 minutes**.

---

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (recommended) or MongoDB 7.0+ installed locally
- Two terminal windows

---

## Step-by-Step Instructions

### 1. Navigate to Project Directory
```bash
cd Z:\pos
```

### 2. Create Backend Environment File

Create `backend/.env` file with this content:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0
JWT_SECRET=my-super-secret-jwt-key-that-is-at-least-32-characters-long
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
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
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=INFO
SLOW_QUERY_THRESHOLD=1000
"@ | Out-File -FilePath .env -Encoding utf8
cd ..
```

### 3. Create Frontend Environment File

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

### 4. Install Dependencies and Start Services

**Backend (Terminal 1):**
```bash
cd backend
npm install
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
```

Wait until you see:
- ✅ Backend: `Server running on port 5000`
- ✅ Frontend: Server running on port 5173 (or port shown in terminal)

**This takes about 1-2 minutes on first run.**

### 5. Create Your First User

You need to create a user to login. Here's the easiest way:

**Using Node.js Script:**
```bash
cd backend
node scripts/createUser.js
```

This creates an admin user with:
- Email: `admin@test.com`
- Password: `admin123`
- Role: `ADMIN`

### 6. Open in Browser

**Frontend Application:**
```
http://localhost:5173
```

**Backend Health Check:**
```
http://localhost:5000/api/health
```

### 7. Login

- Email: `admin@test.com`
- Password: `admin123`

You should now see the dashboard!

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
Open: http://localhost:5173

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

### Issue: "Port already in use"
**Solution:**
1. Find what's using the port:
   ```powershell
   netstat -ano | findstr :5000
   ```
2. Stop that process or change port in backend/.env

### Issue: "Login fails"
**Solution:**
1. Verify user exists in database
2. Check password hash is correct
3. Verify user `isActive: true`
4. Check backend logs for errors

---

## 📊 Monitoring Services

### View Logs

**Backend:**
- Logs appear in terminal where `npm run dev` is running

**Frontend:**
- Logs appear in terminal and browser console (F12)

### Check Service Status

**Backend:**
```bash
# Check if running
curl http://localhost:5000/api/health
```

**Frontend:**
- Open browser and check if page loads

### Stop Services

Press `Ctrl+C` in each terminal running the services.

---

## 🎯 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://localhost:5000 | REST API |
| Health Check | http://localhost:5000/api/health | Service status |
| Metrics | http://localhost:5000/api/health/metrics | System metrics |
| MongoDB | MongoDB Atlas or localhost:27017 | Database |

---

## ✅ Success Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] Backend health check returns OK
- [ ] Frontend loads in browser
- [ ] Can login with created user
- [ ] Dashboard displays correctly
- [ ] POS page loads products
- [ ] Can add items to cart
- [ ] Checkout works

Once all checked, you're ready to use the system! 🎉
