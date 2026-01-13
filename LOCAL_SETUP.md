# Local Development Setup

This guide provides step-by-step instructions for setting up the POS system on your local machine.

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB Atlas account** (recommended) or **MongoDB 7.0+** locally
- **npm** (comes with Node.js) or **yarn**

---

## 🚀 Quick Setup (5 Minutes)

### 1. MongoDB Setup

**Using MongoDB Atlas (Recommended):**
- Use your MongoDB Atlas connection string
- Ensure your IP address is whitelisted in MongoDB Atlas Network Access

**Using Local MongoDB:**
```bash
# Verify MongoDB is running
mongosh

# If it connects, you're good!
# If not, start MongoDB (Windows usually runs as service)
```

### 2. Backend Setup

```bash
cd backend
npm install
# Create .env file (see below)
npm run dev
```

**Backend `.env` file:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0
JWT_SECRET=my-super-secret-jwt-key-that-is-at-least-32-characters-long
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=INFO
SLOW_QUERY_THRESHOLD=1000
```

### 3. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
# Create .env file (see below)
npm run dev
```

**Frontend `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Create Admin User (New Terminal)

```bash
cd backend
node scripts/createUser.js
```

### 5. Open Browser

Navigate to: **http://localhost:5173** (or port shown in terminal)

Login:
- Email: `admin@test.com`
- Password: `admin123`

---

## ✅ Verify Installation

### Backend Health Check
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

### Frontend
- Should show login page
- No console errors (F12)
- Can login successfully

---

## 🐛 Common Issues

### MongoDB Connection Issues
**For MongoDB Atlas:**
- Verify connection string is correct in `backend/.env`
- Check your IP address is whitelisted in MongoDB Atlas Network Access
- Verify database name is included in connection string

**For Local MongoDB:**
```bash
# Check if running
mongosh

# If not, start MongoDB service (Windows)
# Or install MongoDB locally and start the service
```

### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Kill process or change port in .env
```

### Dependencies Missing
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### CORS Errors
- Check `ALLOWED_ORIGINS` in `backend/.env` includes frontend URL
- Verify `VITE_API_URL` in `frontend/.env` matches backend URL

---

## 📝 Development Workflow

### Starting Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Stopping Services

Press `Ctrl+C` in each terminal.

---

## 🎯 Next Steps

1. **Seed Sample Data**
   ```bash
   cd backend
   npm run seed
   ```

2. **Explore Features**
   - POS checkout
   - Inventory management
   - Reports and analytics

3. **Read Documentation**
   - [API Endpoints](./README.md#-api-endpoints)
   - [Data Insertion](./QUICK_DATA_INSERT.md)
   - [Project Structure](./README.md#project-structure)

---

## 📚 Additional Resources

- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **Complete Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Main README**: [README.md](./README.md)

---

**Happy coding!** 🚀
