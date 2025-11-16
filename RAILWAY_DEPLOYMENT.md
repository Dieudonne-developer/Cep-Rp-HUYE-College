# Railway Deployment Guide

Complete guide for deploying the CEP backend on Railway.

## Overview

This guide covers deploying the CEP backend from Render to Railway. Railway offers better SMTP support and more flexible deployment options.

## Prerequisites

1. Railway account: [Sign up here](https://railway.app/)
2. GitHub repository access: `Dieudonne-developer/Cep-Rp-HUYE-College`
3. MongoDB already on Railway (Railway MongoDB plugin)

## Step 1: Create Railway Project

### Option A: Deploy from GitHub (Recommended)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select repository: `Dieudonne-developer/Cep-Rp-HUYE-College`
6. Railway will detect the project

### Option B: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Link to existing project (if you have one)
railway link
```

## Step 2: Configure Service

1. In Railway Dashboard, click **"New Service"**
2. Select **"GitHub Repo"** → Your repository
3. Railway will detect the project structure
4. **Important**: Set the root directory to `backend`

### Service Configuration

- **Root Directory**: `backend`
- **Build Command**: Railway will auto-detect (uses Dockerfile)
- **Start Command**: `node server.js` (from Dockerfile CMD)

## Step 3: Configure Environment Variables

Go to your service → **Variables** tab and add:

### Copy from `backend/RAILWAY_ENV_VARIABLES.txt`

Or add manually:

```
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
```

```
NODE_ENV=production
```

```
EMAIL_USER=cep.rp.huye@gmail.com
```

```
EMAIL_APP_PASSWORD=eygpnyeszsbbasoo
```

```
CLIENT_ORIGIN=https://cep-rp-huye-college.vercel.app
```

```
FRONTEND_URL=https://cep-rp-huye-college.vercel.app
```

### Optional Variables

```
JWT_SECRET=cep-jwt-secret-key-change-this-to-random-string
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
DEBUG_CORS=false
```

### Important Notes

- **PORT**: Railway automatically sets this (don't set manually)
- **BACKEND_URL**: Railway provides this automatically (get from service settings)
- **EMAIL_APP_PASSWORD**: Must be without spaces (`eygpnyeszsbbasoo`)

## Step 4: Configure Build Settings

### Option A: Dockerfile (Recommended)

Railway will automatically detect `backend/Dockerfile`:

1. Railway detects Dockerfile in `backend/` directory
2. Builds Docker image automatically
3. Runs container with proper settings

### Option B: Nixpacks (Alternative)

If not using Dockerfile:

1. Railway auto-detects Node.js project
2. Uses Nixpacks to build
3. Runs `npm install` and `npm start`

## Step 5: Deploy

1. Railway will automatically deploy after configuration
2. Watch deployment logs in Railway Dashboard
3. Wait for deployment to complete
4. Service status should show "Active"

## Step 6: Get Your Backend URL

1. Go to Service → **Settings** → **Networking**
2. Railway provides a default domain:
   - Format: `https://your-service-name.up.railway.app`
3. Or generate a custom domain:
   - Click **"Generate Domain"**
   - Copy the provided URL

## Step 7: Update Frontend

After getting your Railway backend URL:

1. Go to **Vercel Dashboard** → Your Project → Settings → Environment Variables
2. Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://your-service-name.up.railway.app
   ```
3. Redeploy frontend on Vercel

## Step 8: Verify Deployment

### Check Backend

1. Visit your Railway URL: `https://your-service-name.up.railway.app`
2. Should see: `{"message":"CEP Backend API","status":"ok"}`
3. Check logs for any errors

### Test API Endpoints

```bash
# Health check
curl https://your-service-name.up.railway.app/

# Test CORS
curl -H "Origin: https://cep-rp-huye-college.vercel.app" \
     https://your-service-name.up.railway.app/
```

### Test Email (Railway Advantage)

Unlike Render, Railway doesn't block SMTP:

1. **Test Registration**: 
   - Register a new user
   - Check if verification email is sent
   - Email should work without fallback mechanism

2. **Test Password Reset**:
   - Request password reset
   - Check if verification code email is sent
   - Email should work properly

## Railway Advantages Over Render

| Feature | Railway | Render |
|---------|---------|--------|
| **SMTP Support** | ✅ No blocking | ❌ Free tier blocks SMTP |
| **Email Sending** | ✅ Works out of the box | ⚠️ Needs fallback mechanism |
| **Port Configuration** | ✅ Auto-assigned | ⚠️ Must specify (10000) |
| **HTTPS** | ✅ Automatic | ✅ Automatic |
| **Free Tier** | ✅ Generous | ⚠️ More restrictive |
| **Environment Variables** | ✅ Easy setup | ✅ Easy setup |
| **Database Integration** | ✅ Seamless (Railway MongoDB) | ✅ Works (Railway MongoDB) |
| **Build System** | ✅ Dockerfile + Nixpacks | ✅ Dockerfile |

## Troubleshooting

### Service Won't Start

**Check Logs**:
- Railway Dashboard → Service → Deployments → Logs
- Look for startup errors

**Common Issues**:
1. **Port not set**: Railway sets PORT automatically, but verify server uses `process.env.PORT`
2. **Missing env vars**: Ensure all required variables are set
3. **Dockerfile issues**: Check if Dockerfile builds locally

### Database Connection Failed

1. **Check MONGODB_URI**: Verify connection string is correct
2. **Check Railway MongoDB Service**: Ensure MongoDB service is running
3. **Network Access**: Railway services can access each other automatically
4. **Connection String**: Use full connection string with credentials

### Email Not Working

1. **Railway doesn't block SMTP**: Unlike Render, email should work
2. **Check Credentials**: Verify `EMAIL_USER` and `EMAIL_APP_PASSWORD`
3. **Check Logs**: Look for email errors in Railway logs
4. **Test Locally**: Test with Railway environment variables

### CORS Issues

1. **Check CLIENT_ORIGIN**: Should match Vercel frontend URL
2. **Check FRONTEND_URL**: Should match Vercel frontend URL
3. **Verify CORS Middleware**: Check `backend/middleware/cors.js`
4. **Check Logs**: Look for CORS errors

### Build Failed

1. **Check Dockerfile**: Verify Dockerfile syntax
2. **Check package.json**: Ensure all dependencies are listed
3. **Check Logs**: Look for build errors in Railway logs
4. **Test Locally**: Build Docker image locally

## Environment Variables Reference

### Required Variables

```
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
NODE_ENV=production
EMAIL_USER=cep.rp.huye@gmail.com
EMAIL_APP_PASSWORD=eygpnyeszsbbasoo
CLIENT_ORIGIN=https://cep-rp-huye-college.vercel.app
FRONTEND_URL=https://cep-rp-huye-college.vercel.app
```

### Optional Variables

```
JWT_SECRET=cep-jwt-secret-key-change-this-to-random-string
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
DEBUG_CORS=false
```

### Auto-Set by Railway

```
PORT=3000 (or dynamic)
BACKEND_URL=https://your-service-name.up.railway.app
```

## Custom Domain Setup

1. Go to Service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions:
   - Add CNAME record pointing to Railway-provided domain
   - Wait for DNS propagation
   - Railway will automatically configure SSL

## Monitoring and Logs

### View Logs

1. Railway Dashboard → Service → Deployments
2. Click on latest deployment
3. View real-time logs

### Monitor Performance

1. Railway Dashboard → Service → Metrics
2. View CPU, Memory, Network usage
3. Monitor response times

## Rollback Deployment

If something goes wrong:

1. Railway Dashboard → Service → Deployments
2. Find previous working deployment
3. Click **"Redeploy"** to rollback

## Next Steps

1. ✅ Backend deployed on Railway
2. ✅ Environment variables configured
3. ✅ Frontend updated with Railway URL
4. ✅ Email functionality tested (should work without fallback)
5. ✅ All features verified

## Additional Resources

- **Railway Documentation**: [https://docs.railway.app/](https://docs.railway.app/)
- **Railway CLI**: [https://docs.railway.app/develop/cli](https://docs.railway.app/develop/cli)
- **Railway Community**: [https://discord.gg/railway](https://discord.gg/railway)

---

**Last Updated**: November 2025  
**Deployment Platform**: Railway  
**Backend URL**: `https://your-service-name.up.railway.app`  
**Frontend URL**: `https://cep-rp-huye-college.vercel.app`  
**Database**: Railway MongoDB Plugin

