# Vercel Deployment Guide

Quick reference for deploying the frontend to Vercel.

## Quick Setup

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variable**
   ```
   VITE_API_BASE_URL=https://cep-backend-hjfu.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Your site will be live at: `https://cep-rp-huye-college.vercel.app`

## Project Configuration

The `frontend/vercel.json` file is already configured with:
- SPA routing (all routes redirect to `/index.html`)
- Asset caching headers

## Environment Variables

Required environment variable:
- `VITE_API_BASE_URL`: Backend API URL (set to Render backend URL)

## Build Process

Vercel will:
1. Install dependencies (`npm install`)
2. Build the project (`npm run build`)
3. Deploy the `dist` folder
4. Serve static files with proper routing

## Custom Domain

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed by Vercel

## Automatic Deployments

Vercel automatically deploys:
- Every push to `main` branch → Production
- Every push to other branches → Preview deployment

## Troubleshooting

**Build fails:**
- Check that `VITE_API_BASE_URL` is set
- Verify `frontend/package.json` has correct build script
- Check Vercel build logs for errors

**404 on routes:**
- Ensure `vercel.json` is in `frontend` directory
- Verify rewrites are configured correctly

**API connection errors:**
- Verify `VITE_API_BASE_URL` points to correct backend URL
- Check backend is running and accessible
- Verify CORS is configured on backend

