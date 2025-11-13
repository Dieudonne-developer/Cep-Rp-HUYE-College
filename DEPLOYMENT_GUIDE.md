# Deployment Guide

This project is configured for deployment across three platforms:

- **Frontend**: Vercel (React/Vite) - `https://cep-rp-huye-college.vercel.app`
- **Backend**: Render (Express/Node.js) - `https://cep-backend-hjfu.onrender.com`
- **Database**: Railway (MongoDB plugin) - Railway MongoDB connection string

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Database Setup (Railway)](#database-setup-railway)
5. [Environment Variables](#environment-variables)
6. [Verification](#verification)

---

## Prerequisites

- GitHub account with repository access
- Vercel account
- Render account
- Railway account
- MongoDB connection string from Railway

---

## Frontend Deployment (Vercel)

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
VITE_API_BASE_URL=https://cep-backend-hjfu.onrender.com
```

**Important**: This must be set for the build to work correctly.

### Step 3: Deploy

1. Click **"Deploy"**
2. Vercel will automatically build and deploy your frontend
3. Your frontend will be available at: `https://cep-rp-huye-college.vercel.app`

### Step 4: Custom Domain (Optional)

If you want a custom domain:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

---

## Backend Deployment (Render)

### Step 1: Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `cep-backend`
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile` (relative to rootDir)

### Step 2: Configure Environment Variables

In Render Dashboard → Environment → Environment Variables, add:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232
CLIENT_ORIGIN=https://cep-rp-huye-college.vercel.app
FRONTEND_URL=https://cep-rp-huye-college.vercel.app
```

**Important**: 
- Replace `MONGODB_URI` with your actual Railway MongoDB connection string
- The `BACKEND_URL` is automatically set by Render (you don't need to set it manually)

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy your backend
3. Your backend will be available at: `https://cep-backend-hjfu.onrender.com`

### Step 4: Using render.yaml (Alternative)

If you prefer using `render.yaml`:

1. The `render.yaml` file is already configured in the repository
2. In Render Dashboard → Blueprint → Connect Repository
3. Render will automatically detect and use `render.yaml`
4. Make sure to set `MONGODB_URI` in the Render Dashboard (it's marked as `sync: false`)

---

## Database Setup (Railway)

### Step 1: Create MongoDB Service

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Click **"New"** → **"Database"** → **"Add MongoDB"**
4. Railway will provision a MongoDB instance

### Step 2: Get Connection String

1. Click on your MongoDB service
2. Go to the **"Connect"** tab
3. Copy the **"MongoDB Connection URL"**
4. It will look like: `mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232`

### Step 3: Use Connection String

Use this connection string in:
- Render backend environment variables (`MONGODB_URI`)
- Local development `.env` file (if needed)

---

## Environment Variables

### Frontend (Vercel)

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://cep-backend-hjfu.onrender.com` | Backend API URL |

### Backend (Render)

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Server port (Render sets this automatically) |
| `MONGODB_URI` | `mongodb://mongo:...@gondola.proxy.rlwy.net:30232` | Railway MongoDB connection string |
| `CLIENT_ORIGIN` | `https://cep-rp-huye-college.vercel.app` | Frontend URL for CORS |
| `FRONTEND_URL` | `https://cep-rp-huye-college.vercel.app` | Frontend URL for redirects |
| `BACKEND_URL` | Auto-set by Render | Backend URL (auto-configured) |

---

## Verification

### 1. Check Frontend

Visit: `https://cep-rp-huye-college.vercel.app`

- Should load the homepage
- Check browser console for API connection logs
- Should see: `Using Render backend URL for Vercel frontend: https://cep-backend-hjfu.onrender.com`

### 2. Check Backend

Visit: `https://cep-backend-hjfu.onrender.com/health`

- Should return: `{ "status": "ok", "timestamp": "...", "port": 10000, "nodeEnv": "production" }`

### 3. Check API Connection

1. Open browser DevTools → Network tab
2. Visit: `https://cep-rp-huye-college.vercel.app/admin/login`
3. Check for API calls to `https://cep-backend-hjfu.onrender.com/api/...`
4. Should see successful responses (not CORS errors)

### 4. Check Database Connection

1. Log into Render Dashboard
2. Go to your backend service → Logs
3. Should see: `✅ Connected to MongoDB`
4. Should see database connection details

### 5. Test Admin Login

1. Visit: `https://cep-rp-huye-college.vercel.app/admin/login`
2. Use test credentials:
   - **Super Admin**: `superadmin@cep.com` / `SuperAdmin@2024`
   - **Admin**: `admin@cep.com` / `admin123`
3. Should successfully login and redirect to dashboard

---

## Troubleshooting

### Frontend Issues

**Problem**: Frontend shows "Network error" or can't connect to backend
- **Solution**: Check `VITE_API_BASE_URL` is set correctly in Vercel
- **Solution**: Verify backend is running and accessible

**Problem**: 404 errors on routes
- **Solution**: Ensure `vercel.json` is in the `frontend` directory
- **Solution**: Check that rewrites are configured correctly

### Backend Issues

**Problem**: Backend returns 500 errors
- **Solution**: Check Render logs for MongoDB connection errors
- **Solution**: Verify `MONGODB_URI` is correct and accessible from Render
- **Solution**: Check Railway MongoDB service is running

**Problem**: CORS errors
- **Solution**: Verify `CLIENT_ORIGIN` and `FRONTEND_URL` are set to Vercel URL
- **Solution**: Check backend logs for CORS blocking messages

### Database Issues

**Problem**: MongoDB connection refused
- **Solution**: Verify Railway MongoDB service is running
- **Solution**: Check connection string is correct (no typos)
- **Solution**: Ensure Railway MongoDB allows connections from Render IPs

---

## Local Development

For local development, use:

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend
```bash
cd backend
npm install
# Create .env file with:
# MONGODB_URI=mongodb://localhost:27017/cep_database
# CLIENT_ORIGIN=http://localhost:5173
npm start
# Runs on http://localhost:4000
```

### Docker Compose (Alternative)
```bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# MongoDB: localhost:27017
```

---

## Production URLs

- **Frontend**: https://cep-rp-huye-college.vercel.app
- **Backend**: https://cep-backend-hjfu.onrender.com
- **Database**: Railway MongoDB (internal connection)

---

## Support

If you encounter issues:

1. Check the logs in each platform's dashboard
2. Verify all environment variables are set correctly
3. Ensure all services are running and accessible
4. Check CORS configuration matches your frontend URL
5. Verify MongoDB connection string is correct

---

## Notes

- **Vercel** automatically handles HTTPS and CDN
- **Render** free tier may spin down after inactivity (first request may be slow)
- **Railway** MongoDB is persistent and always available
- All three services are configured for production use
- Frontend automatically detects Vercel environment and uses correct backend URL

