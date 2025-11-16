# Railway Deployment Setup Guide

This guide shows you how to deploy the CEP backend on Railway.

## Quick Setup Steps

### 1. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"** (or use Railway CLI)
4. Connect your repository: `Dieudonne-developer/Cep-Rp-HUYE-College`
5. Select the **backend** directory as the root

### 2. Configure Railway Service

Railway will automatically detect the Dockerfile in the `backend` directory.

#### Option A: Deploy from Dockerfile (Recommended)

1. Railway will automatically detect `backend/Dockerfile`
2. Set the root directory to `backend` in Railway settings
3. Railway will build and deploy automatically

#### Option B: Use Nixpacks (Alternative)

1. Railway can auto-detect Node.js projects
2. Make sure `package.json` is in the root directory
3. Railway will install dependencies and run `npm start`

### 3. Set Environment Variables

Go to your Railway service → **Variables** tab and add:

#### Required Variables

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

#### Optional Variables

```
JWT_SECRET=cep-jwt-secret-key-change-this-to-random-string
```

```
MAX_FILE_SIZE=104857600
```

```
UPLOAD_PATH=./uploads
```

```
DEBUG_CORS=false
```

### 4. Important Notes

#### Port Configuration

- **Railway automatically sets `PORT`** environment variable
- Your server should use `process.env.PORT || 3000`
- Railway typically uses port `3000` or assigns dynamically
- The Dockerfile exposes port `3000` by default

#### Backend URL

- Railway provides a **public URL** automatically
- You can get it from the service settings → **Domains** tab
- Railway format: `https://your-service-name.railway.app`
- Use this URL for `BACKEND_URL` if needed

#### MongoDB Connection

- Your MongoDB is already on Railway (Railway MongoDB plugin)
- The `MONGODB_URI` is already configured above
- No additional setup needed for database

### 5. Railway-Specific Features

#### Automatic HTTPS

- Railway automatically provides HTTPS
- Your backend will be available at `https://your-service.railway.app`
- No SSL certificate configuration needed

#### Environment Variables

- Set in Railway Dashboard → Service → Variables
- Variables are automatically injected at runtime
- Changes require redeployment (automatic)

#### Logs

- View logs in Railway Dashboard → Service → Deployments → Logs
- Real-time logs available
- Logs are retained for deployment history

### 6. Custom Domain (Optional)

1. Go to Service → **Settings** → **Networking**
2. Click **"Generate Domain"** for a Railway domain
3. Or add a custom domain:
   - Click **"Custom Domain"**
   - Add your domain name
   - Follow DNS configuration instructions

### 7. Verify Deployment

After deployment, check:

1. **Service Status**: Should show "Active" in Railway Dashboard
2. **Health Check**: Visit your Railway URL (e.g., `https://your-service.railway.app`)
3. **Logs**: Check logs for any errors
4. **Database**: Verify MongoDB connection in logs
5. **Email**: Test registration/password reset (Railway doesn't block SMTP like Render)

### 8. Update Frontend API URL

After getting your Railway backend URL, update frontend:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_BASE_URL` to your Railway URL:
   ```
   VITE_API_BASE_URL=https://your-service.railway.app
   ```
3. Redeploy frontend on Vercel

## Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| SMTP Blocking | ✅ No blocking | ❌ Free tier blocks SMTP |
| Email Support | ✅ Works out of the box | ⚠️ Needs fallback mechanism |
| Port Configuration | ✅ Auto-assigned | ⚠️ Must specify (10000) |
| Environment Variables | ✅ Easy setup | ✅ Easy setup |
| HTTPS | ✅ Automatic | ✅ Automatic |
| Free Tier | ✅ Generous | ⚠️ More restrictive |

## Troubleshooting

### Service Won't Start

1. **Check Logs**: Railway Dashboard → Deployments → Logs
2. **Verify PORT**: Make sure server uses `process.env.PORT || 3000`
3. **Check Environment Variables**: Verify all required variables are set
4. **Dockerfile Issues**: Check if Dockerfile builds correctly locally

### Email Not Working

1. **Railway doesn't block SMTP**: Unlike Render, Railway allows SMTP connections
2. **Check Credentials**: Verify `EMAIL_USER` and `EMAIL_APP_PASSWORD`
3. **Check Logs**: Look for email-related errors in Railway logs
4. **Test Locally**: Test email functionality with Railway environment variables

### Database Connection Issues

1. **Verify MONGODB_URI**: Check if connection string is correct
2. **Check Railway MongoDB Service**: Ensure MongoDB service is running
3. **Network Access**: Railway services can access each other automatically
4. **Connection String Format**: Use full connection string with credentials

### CORS Issues

1. **Check CLIENT_ORIGIN**: Should match your Vercel frontend URL
2. **Check FRONTEND_URL**: Should match your Vercel frontend URL
3. **Verify CORS Middleware**: Check `backend/middleware/cors.js`
4. **Check Logs**: Look for CORS errors in Railway logs

## Quick Reference

### Railway CLI (Optional)

Install Railway CLI for easier deployment:

```bash
npm i -g @railway/cli
railway login
railway link  # Link to existing project
railway up    # Deploy
```

### Environment Variables Summary

```
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
NODE_ENV=production
EMAIL_USER=cep.rp.huye@gmail.com
EMAIL_APP_PASSWORD=eygpnyeszsbbasoo
CLIENT_ORIGIN=https://cep-rp-huye-college.vercel.app
FRONTEND_URL=https://cep-rp-huye-college.vercel.app
JWT_SECRET=cep-jwt-secret-key-change-this-to-random-string
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
DEBUG_CORS=false
```

### Railway URL Format

Your backend will be available at:
```
https://your-service-name.up.railway.app
```

Or with a custom domain:
```
https://your-custom-domain.com
```

---

**Last Updated**: November 2025  
**Railway Service**: Backend API  
**Database**: Railway MongoDB Plugin  
**Frontend**: Vercel (https://cep-rp-huye-college.vercel.app)

