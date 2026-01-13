# Deployment Guide - Railway (Backend) & Vercel (Frontend)

This guide will help you deploy the POS system to production using Railway for the backend and Vercel for the frontend.

---

## 🚀 Prerequisites

- GitHub account (for connecting repositories)
- Railway account - [Sign up](https://railway.app)
- Vercel account - [Sign up](https://vercel.com)
- MongoDB Atlas account (or Railway MongoDB service)

---

## 📦 Part 1: Deploy Backend to Railway

### Step 1: Prepare Your Repository

1. Push your code to GitHub (if not already done)
2. Ensure `backend/railway.json` exists (already created)
3. Ensure `backend/package.json` has a `start` script (already configured)

### Step 2: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Select the **`backend`** folder as the root directory

### Step 3: Configure Environment Variables

In Railway, go to your service → **Variables** tab and add:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
LOG_LEVEL=INFO
SLOW_QUERY_THRESHOLD=1000
```

**Important Notes:**
- `MONGODB_URI`: Use your MongoDB Atlas connection string
- `JWT_SECRET`: Generate a strong secret (minimum 32 characters)
- `ALLOWED_ORIGINS`: Set this to your Vercel frontend URL (you'll update this after deploying frontend)
- Railway will automatically set `PORT` - you can use `process.env.PORT` in your code (already configured)

### Step 4: Deploy

1. Railway will automatically detect Node.js and start building
2. The build process will:
   - Install dependencies (`npm install`)
   - Start the server (`npm start`)
3. Wait for deployment to complete (usually 2-3 minutes)

### Step 5: Get Your Backend URL

1. Once deployed, Railway will provide a URL like: `https://your-app.up.railway.app`
2. Your API will be available at: `https://your-app.up.railway.app/api`
3. Test the health endpoint: `https://your-app.up.railway.app/api/health`

### Step 6: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Railway's DNS configuration instructions

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Your Repository

1. Ensure `frontend/vercel.json` exists (already created)
2. Ensure `frontend/package.json` has a `build` script (already configured)

### Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Step 3: Configure Environment Variables

In Vercel, go to **Settings** → **Environment Variables** and add:

```env
VITE_API_URL=https://your-railway-backend.up.railway.app/api
NODE_ENV=production
```

**Important:**
- Replace `https://your-railway-backend.up.railway.app/api` with your actual Railway backend URL
- Vercel will automatically prefix `VITE_` variables for Vite apps

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build the project (`npm run build`)
   - Deploy to CDN
3. Wait for deployment to complete (usually 1-2 minutes)

### Step 5: Get Your Frontend URL

1. Once deployed, Vercel will provide a URL like: `https://your-app.vercel.app`
2. Your frontend will be available at this URL
3. Test by opening the URL in your browser

### Step 6: Update Backend CORS Settings

1. Go back to Railway → Your backend service → **Variables**
2. Update `ALLOWED_ORIGINS` to include your Vercel URL:
   ```env
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy with the new environment variable

### Step 7: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

---

## ✅ Post-Deployment Checklist

### Backend (Railway)

- [ ] Health check works: `https://your-backend.up.railway.app/api/health`
- [ ] Environment variables are set correctly
- [ ] MongoDB connection is working (check Railway logs)
- [ ] CORS is configured with frontend URL
- [ ] Custom domain configured (if applicable)

### Frontend (Vercel)

- [ ] Frontend loads at `https://your-app.vercel.app`
- [ ] Environment variable `VITE_API_URL` points to Railway backend
- [ ] Can make API calls to backend (check browser console)
- [ ] No CORS errors in browser console
- [ ] Custom domain configured (if applicable)

### Integration

- [ ] Frontend can connect to backend API
- [ ] Login functionality works
- [ ] API requests are successful
- [ ] No console errors

---

## 🔧 Troubleshooting

### Backend Issues

**Issue: Build fails on Railway**
- Check Railway logs for error messages
- Verify `package.json` has correct `start` script
- Ensure all dependencies are listed in `package.json`

**Issue: MongoDB connection fails**
- Verify `MONGODB_URI` is correct in Railway environment variables
- Check MongoDB Atlas Network Access allows Railway IPs (or use 0.0.0.0/0 for all)
- Check Railway logs for connection errors

**Issue: CORS errors**
- Verify `ALLOWED_ORIGINS` includes your Vercel frontend URL
- Check that the URL matches exactly (including https://)
- Restart the Railway service after updating environment variables

### Frontend Issues

**Issue: Build fails on Vercel**
- Check Vercel build logs for errors
- Verify `package.json` has correct `build` script
- Ensure all dependencies are listed in `package.json`

**Issue: API calls fail**
- Verify `VITE_API_URL` is set correctly in Vercel environment variables
- Check browser console for CORS errors
- Verify backend is running and accessible

**Issue: 404 errors on page refresh**
- This is handled by `vercel.json` rewrites (already configured)
- Verify `vercel.json` is in the `frontend` directory

---

## 📊 Monitoring

### Railway Monitoring

1. **Logs**: View real-time logs in Railway dashboard
2. **Metrics**: Check CPU, memory, and network usage
3. **Deployments**: View deployment history and rollback if needed

### Vercel Monitoring

1. **Logs**: View build and runtime logs in Vercel dashboard
2. **Analytics**: Enable Vercel Analytics for performance monitoring
3. **Deployments**: View deployment history and preview deployments

---

## 🔄 Updating Deployments

### Backend Updates

1. Push changes to GitHub
2. Railway will automatically detect changes and redeploy
3. Monitor deployment in Railway dashboard

### Frontend Updates

1. Push changes to GitHub
2. Vercel will automatically detect changes and redeploy
3. Monitor deployment in Vercel dashboard

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files to Git
2. **JWT Secret**: Use a strong, randomly generated secret (minimum 32 characters)
3. **MongoDB**: Use MongoDB Atlas with IP whitelisting or Railway MongoDB service
4. **CORS**: Only allow your frontend domain in `ALLOWED_ORIGINS`
5. **HTTPS**: Both Railway and Vercel provide HTTPS by default

---

## 📝 Environment Variables Reference

### Backend (Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` (Railway sets this automatically) |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-32-chars-min` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://your-app.vercel.app` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `SLOW_QUERY_THRESHOLD` | Slow query threshold (ms) | `1000` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.up.railway.app/api` |
| `NODE_ENV` | Environment | `production` |

---

## 🎯 Quick Deploy Commands

### Railway CLI (Optional)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Vercel CLI (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

---

## 🆘 Support

- **Railway Docs**: [https://docs.railway.app](https://docs.railway.app)
- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: Check GitHub issues or create a new one

---

**Happy deploying! 🚀**

