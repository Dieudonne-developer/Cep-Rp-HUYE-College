# CRITICAL: Render Dashboard Configuration Fix

## Problem
If you see "Publish Directory: frontend/dist" in Render dashboard, the service is configured as a **STATIC SITE** instead of a **WEB SERVICE**. This causes 404 errors because static sites don't support SPA routing.

## Solution: Remove Publish Directory Setting

### Steps to Fix in Render Dashboard:

1. **Go to Render Dashboard**
   - Navigate to your frontend service (`cep-frontend`)

2. **Go to Settings Tab**
   - Click on "Settings" in the left sidebar

3. **Remove Publish Directory**
   - Look for "Publish Directory" or "Static Publish Path" field
   - **DELETE/REMOVE** this value (leave it empty)
   - If you see `frontend/dist` or `dist`, remove it completely

4. **Verify Service Type**
   - Make sure the service type is **"Web Service"** (not "Static Site")
   - If it says "Static Site", you need to recreate it as a "Web Service"

5. **Verify Dockerfile Path**
   - In Settings, check "Dockerfile Path"
   - Should be: `frontend/Dockerfile`
   - If it's missing, add it

6. **Verify Root Directory**
   - Check "Root Directory"
   - Should be: `frontend`
   - If it's different, change it to `frontend`

7. **Save Changes**
   - Click "Save Changes"
   - The service will redeploy

## If Service is Still Static Site:

If you can't change it from Static Site to Web Service:

1. **Delete the current service** (or create a new one)
2. **Create a new Web Service** (not Static Site)
3. **Configure it manually**:
   - Name: `cep-frontend`
   - Root Directory: `frontend`
   - Dockerfile Path: `frontend/Dockerfile`
   - Environment: `Node`
   - Plan: `Free`
   - **DO NOT SET** a Publish Directory
   - **DO NOT SET** a Build Command (Dockerfile handles this)

## Verify Configuration

After fixing, your service should have:
- ✅ Type: **Web Service** (not Static Site)
- ✅ Root Directory: `frontend`
- ✅ Dockerfile Path: `frontend/Dockerfile`
- ✅ Publish Directory: **EMPTY** (not set)
- ✅ Build Command: **EMPTY** (Dockerfile handles it)
- ✅ Start Command: **EMPTY** (Dockerfile handles it)

## Why This Matters

- **Static Site**: Render serves files directly from a directory (no Express server)
- **Web Service**: Render runs your Docker container with Express server
- **With Publish Directory**: Render bypasses your Express server
- **Without Publish Directory**: Render uses your Dockerfile and Express server

## After Fixing

1. **Redeploy the service**
2. **Check logs** - should see Express server starting
3. **Test routes** - `/admin/login` should work
4. **Check health endpoint** - `/health` should return JSON

