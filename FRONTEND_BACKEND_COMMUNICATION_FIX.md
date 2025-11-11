# Frontend-Backend Communication Fix

## Problem
Frontend and backend are not communicating on Render (production). They work on localhost but not on Render.

## Root Causes

1. **VITE_API_BASE_URL not set at build time** - Vite needs environment variables during build, not runtime
2. **Backend URL inference failing** - The frontend can't determine the correct backend URL
3. **CORS configuration** - May need to ensure all Render domains are allowed

## Solutions Applied

### 1. Enhanced API URL Detection (`frontend/src/utils/api.ts`)

**Added:**
- ✅ Better logging to debug URL detection
- ✅ Multiple fallback strategies for Render URL detection
- ✅ Service name pattern detection (frontend -> backend)
- ✅ Better error handling and logging

**How it works:**
1. First checks `VITE_API_BASE_URL` (set at build time)
2. If on Render, tries multiple patterns to find backend:
   - Removes `-1` suffix from frontend URL
   - Replaces `frontend` with `backend` in service name
   - Uses common Render URL patterns
3. Falls back to localhost for local development

### 2. Enhanced Dockerfile Build (`frontend/Dockerfile`)

**Added:**
- ✅ Debug logging to show what API URL is being used during build
- ✅ Ensures `VITE_API_BASE_URL` is passed correctly

### 3. CORS Configuration (`backend/middleware/cors.js`)

**Already configured:**
- ✅ Allows all `.onrender.com` domains
- ✅ Uses `CLIENT_ORIGIN` from environment variables
- ✅ Pattern matching for Render domains

## Verification Steps

### Step 1: Check Build Logs

In Render Dashboard → `cep-frontend` → **Logs**, look for:
```
Building with VITE_API_BASE_URL=https://cep-backend-xxx.onrender.com
```

### Step 2: Check Browser Console

Open frontend in browser → Open DevTools (F12) → Console tab

You should see:
```
Detected hostname: cep-frontend-xxx.onrender.com
Detected origin: https://cep-frontend-xxx.onrender.com
Using VITE_API_BASE_URL: https://cep-backend-xxx.onrender.com
```

OR if VITE_API_BASE_URL is not set:
```
Inferred backend URL from frontend: https://cep-backend-xxx.onrender.com
```

### Step 3: Test API Call

In browser console, run:
```javascript
fetch('https://cep-backend-xxx.onrender.com/api/home')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return: `{message: "CEP Backend Server is running!"}`

### Step 4: Check Network Tab

1. Open DevTools (F12) → Network tab
2. Refresh the page
3. Look for API calls to backend
4. Check if they return 200 OK or CORS errors

## Common Issues and Fixes

### Issue 1: VITE_API_BASE_URL Not Set

**Symptoms:**
- Build logs don't show `VITE_API_BASE_URL`
- Browser console shows "Inferred backend URL" instead of "Using VITE_API_BASE_URL"

**Fix:**
1. Check `render.yaml` - `VITE_API_BASE_URL` should use `fromService`
2. Verify service names match:
   - Frontend service: `cep-frontend`
   - Backend service: `cep-backend`
3. Redeploy frontend service

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Network tab shows CORS errors

**Fix:**
1. Check backend logs for CORS messages
2. Verify `CLIENT_ORIGIN` is set in backend environment
3. Check that frontend URL matches `CLIENT_ORIGIN` exactly

### Issue 3: 404 Errors on API Calls

**Symptoms:**
- API calls return 404
- Backend URL is incorrect

**Fix:**
1. Check browser console for the detected backend URL
2. Verify backend service is running
3. Test backend URL directly: `https://cep-backend-xxx.onrender.com/api/home`

### Issue 4: Network Errors

**Symptoms:**
- `Failed to fetch` errors
- `Network error` messages

**Fix:**
1. Verify backend service is running (check Render Dashboard)
2. Check backend health endpoint: `https://cep-backend-xxx.onrender.com/api/home`
3. Verify backend URL is correct in browser console logs

## render.yaml Configuration

The `render.yaml` should have:

```yaml
services:
  - type: web
    name: cep-frontend
    envVars:
      - key: VITE_API_BASE_URL
        fromService:
          type: web
          name: cep-backend
          property: url  # This auto-populates backend URL

  - type: web
    name: cep-backend
    envVars:
      - key: CLIENT_ORIGIN
        fromService:
          type: web
          name: cep-frontend
          property: url  # This auto-populates frontend URL
```

## Manual Configuration (If Blueprint Doesn't Work)

### Frontend Service
1. Go to Render Dashboard → `cep-frontend` → Environment
2. Add: `VITE_API_BASE_URL` = `https://cep-backend-xxx.onrender.com`
3. Replace `xxx` with your actual backend service identifier

### Backend Service
1. Go to Render Dashboard → `cep-backend` → Environment
2. Add: `CLIENT_ORIGIN` = `https://cep-frontend-xxx.onrender.com`
3. Replace `xxx` with your actual frontend service identifier

## Testing

### Test 1: Backend Health
```bash
curl https://cep-backend-xxx.onrender.com/api/home
```
Should return: `{"message":"CEP Backend Server is running!"}`

### Test 2: Frontend API Call
Open browser console on frontend and run:
```javascript
fetch('https://cep-backend-xxx.onrender.com/api/home')
  .then(r => r.json())
  .then(console.log)
```
Should return the same message (no CORS errors)

### Test 3: Full Integration
1. Open frontend in browser
2. Check browser console for API calls
3. Verify no errors
4. Test login functionality

## Summary

✅ **Enhanced API URL detection** with multiple fallback strategies
✅ **Added debug logging** to help identify issues
✅ **Improved Dockerfile** to show build-time variables
✅ **CORS already configured** for Render domains

**The frontend should now correctly communicate with the backend on Render!**

If issues persist:
1. Check browser console logs for detected URLs
2. Verify service names in `render.yaml` match actual Render services
3. Check backend CORS logs for blocked requests
4. Test backend URL directly to ensure it's accessible

