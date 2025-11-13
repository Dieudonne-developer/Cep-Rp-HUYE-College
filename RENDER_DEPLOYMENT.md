# Render Deployment Guide

Quick reference for deploying the backend to Render.

## Quick Setup

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `cep-backend`
   - **Environment**: `Docker`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Plan**: Free

3. **Set Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232
   CLIENT_ORIGIN=https://cep-rp-huye-college.vercel.app
   FRONTEND_URL=https://cep-rp-huye-college.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy
   - Your backend will be at: `https://cep-backend-hjfu.onrender.com`

## Using render.yaml

The repository includes `render.yaml` for automatic configuration:

1. Go to Render Dashboard → Blueprint
2. Connect your repository
3. Render will detect `render.yaml` and create services automatically
4. **Important**: Set `MONGODB_URI` manually in the dashboard (marked as `sync: false`)

## Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `10000` | Yes (auto-set by Render) |
| `MONGODB_URI` | Railway MongoDB connection string | Yes |
| `CLIENT_ORIGIN` | `https://cep-rp-huye-college.vercel.app` | Yes |
| `FRONTEND_URL` | `https://cep-rp-huye-college.vercel.app` | Yes |
| `BACKEND_URL` | Auto-set by Render | No (auto-configured) |

## Health Check

After deployment, verify the backend is running:

```bash
curl https://cep-backend-hjfu.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "port": 10000,
  "nodeEnv": "production"
}
```

## Free Tier Notes

- Service may spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Upgrade to paid plan for always-on service

## Troubleshooting

**Build fails:**
- Check Dockerfile is in `backend` directory
- Verify `backend/package.json` exists
- Check Render build logs for errors

**MongoDB connection errors:**
- Verify `MONGODB_URI` is correct
- Check Railway MongoDB is running
- Ensure connection string is accessible from Render

**CORS errors:**
- Verify `CLIENT_ORIGIN` matches your frontend URL
- Check backend logs for CORS blocking messages
- Ensure frontend URL is in allowed origins list

**500 errors:**
- Check Render logs for detailed error messages
- Verify all environment variables are set
- Check MongoDB connection status

## Logs

View logs in Render Dashboard:
1. Go to your service
2. Click "Logs" tab
3. Monitor for errors and connection status

## Manual Deploy

To manually trigger a deployment:
1. Go to your service
2. Click "Manual Deploy"
3. Select branch and click "Deploy"

