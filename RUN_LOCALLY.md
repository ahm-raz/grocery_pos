# Run Locally - Quick Reference

## 🚀 Fastest Way to Get Started

### 1. MongoDB Setup
**Using MongoDB Atlas:** Use your connection string in `.env` file
**Using Local MongoDB:** `mongosh  # Verify it's running`

### 2. Backend (Terminal 1)
```bash
cd backend
npm install          # First time only
npm run dev          # Start server
```

### 3. Frontend (Terminal 2)
```bash
cd frontend
npm install          # First time only
npm run dev          # Start server
```

### 4. Create User (Terminal 3)
```bash
cd backend
node scripts/createUser.js
```

### 5. Open Browser
- URL: http://localhost:5173
- Login: `admin@test.com` / `admin123`

---

## 📝 Environment Files

### backend/.env
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://ahmrazsal7_db_user:M063T6IXdTjU5zbu@cluster0.y9hqzxj.mongodb.net/grocery_pos?appName=Cluster0
JWT_SECRET=my-super-secret-jwt-key-that-is-at-least-32-characters-long
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=INFO
SLOW_QUERY_THRESHOLD=1000
```

### frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ✅ Quick Verification

1. **Backend**: http://localhost:5000/api/health → Should return `{"status":"OK"}`
2. **Frontend**: http://localhost:5173 → Should show login page
3. **Login**: Use credentials → Should redirect to dashboard

---

## 🐛 Quick Fixes

| Issue | Solution |
|-------|----------|
| MongoDB error | Verify Atlas connection string, check IP whitelist, or verify local MongoDB is running |
| Port in use | Change port in `.env` or kill process |
| CORS error | Check `ALLOWED_ORIGINS` includes frontend URL |
| Missing deps | Run `npm install` in backend/frontend |

---

## 📚 More Help

- **Detailed Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **Data Insertion**: [QUICK_DATA_INSERT.md](./QUICK_DATA_INSERT.md)

---

**That's it!** 🎉
