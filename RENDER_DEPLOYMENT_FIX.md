# Render Deployment Fix - API URL Configuration

## Problem Fixed

The frontend was trying to connect to `http://localhost:4000` instead of the Render backend URL `https://cep-rp-huye-college.onrender.com` when deployed on Render.

## Solution Implemented

1. **Created API Utility Function** (`frontend/src/utils/api.ts`):
   - Detects if the app is running on Render by checking the hostname
   - Automatically uses the correct backend URL based on the environment
   - Falls back to localhost for local development

2. **Updated All Frontend Files**:
   - Replaced all instances of `import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'` 
   - With `getApiBaseUrl()` function call
   - Updated 29+ files across the project

## How It Works

The `getApiBaseUrl()` function:
1. First checks if `VITE_API_BASE_URL` environment variable is set (for build-time configuration)
2. If not set, detects if running on Render by checking if hostname contains `.onrender.com`
3. If on Render, automatically uses `https://cep-rp-huye-college.onrender.com` as backend URL
4. Falls back to `http://localhost:4000` for local development

## Deployment Steps

### Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Fix API URL detection for Render deployment"
git push origin main
```

### Step 2: Verify Environment Variables on Render

**Backend Service** (`cep-backend`):
- `CLIENT_ORIGIN` = `https://cep-rp-huye-college-1.onrender.com`
- `MONGODB_URI` = your MongoDB connection string
- `NODE_ENV` = `production`

**Frontend Service** (`cep-frontend`):
- `VITE_API_BASE_URL` = `https://cep-rp-huye-college.onrender.com` (optional, but recommended)
- The code will auto-detect if not set

### Step 3: Redeploy Services

1. **Redeploy Backend**:
   - Go to Render Dashboard → `cep-backend` service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete

2. **Redeploy Frontend**:
   - Go to Render Dashboard → `cep-frontend` service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete

### Step 4: Verify

1. **Test Backend**:
   - Open: `https://cep-rp-huye-college.onrender.com/api/home`
   - Should return: `{"message":"CEP Backend Server is running!"}`

2. **Test Frontend**:
   - Open: `https://cep-rp-huye-college-1.onrender.com`
   - Open browser console (F12)
   - Should see API calls to `https://cep-rp-huye-college.onrender.com`
   - No errors about `localhost:4000`

## Files Changed

### New Files
- `frontend/src/utils/api.ts` - API URL detection utility

### Updated Files (29+ files)
- All page components that make API calls
- All admin components
- All registration/login pages
- All family pages (Psalm23, Psalm46, Protocol, etc.)

## Technical Details

### API Utility Function

```typescript
export function getApiBaseUrl(): string {
  // Check if VITE_API_BASE_URL is set (build-time)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Detect Render environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname.includes('onrender.com')) {
      // Use Render backend URL
      if (hostname === 'cep-rp-huye-college-1.onrender.com') {
        return 'https://cep-rp-huye-college.onrender.com';
      }
      // Generic Render detection
      // ...
    }
  }

  // Local development fallback
  return `http://localhost:${import.meta.env.VITE_API_PORT || '4000'}`;
}
```

## Benefits

1. **Automatic Detection**: No need to set environment variables for Render deployment
2. **Works Locally**: Still works for local development
3. **Flexible**: Can override with `VITE_API_BASE_URL` if needed
4. **Single Source of Truth**: All API calls use the same utility function

## Troubleshooting

### Issue: Still seeing `localhost:4000` in console

**Solution**:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check that the latest code is deployed
4. Verify the frontend build includes the updated code

### Issue: CORS errors

**Solution**:
1. Verify `CLIENT_ORIGIN` in backend is set to frontend URL
2. Check backend logs for CORS rejection messages
3. Ensure backend service is running

### Issue: API calls failing

**Solution**:
1. Verify backend URL is correct: `https://cep-rp-huye-college.onrender.com`
2. Check backend service is running and accessible
3. Test backend directly: `https://cep-rp-huye-college.onrender.com/api/home`

## Notes

- The utility function works at runtime, so it doesn't require environment variables to be set at build time
- However, setting `VITE_API_BASE_URL` on Render is still recommended for explicit configuration
- The function will automatically detect the Render environment and use the correct backend URL

