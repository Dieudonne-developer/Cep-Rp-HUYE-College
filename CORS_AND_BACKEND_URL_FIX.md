# CORS and Backend URL Fix

## Problem
1. **Wrong Backend URL**: Frontend is inferring `https://cep-backend-vy68.onrender.com` but actual backend is `https://cep-backend-hjfu.onrender.com`
2. **CORS Error**: Backend is blocking requests from frontend
3. **404 Error**: Wrong backend URL returns 404

## Root Causes

### Issue 1: Wrong Backend URL Inference
The frontend was trying to infer the backend URL by replacing "frontend" with "backend" in the service name:
- Frontend: `cep-frontend-vy68.onrender.com`
- Inferred: `cep-backend-vy68.onrender.com` ❌ (wrong)
- Actual: `cep-backend-hjfu.onrender.com` ✅ (correct)

The service identifiers (`vy68` vs `hjfu`) are different, so inference fails.

### Issue 2: CORS Configuration
The backend CORS is configured to allow all `.onrender.com` domains, but the wrong backend URL was being used, causing CORS errors.

## Solutions Applied

### 1. Fixed Backend URL Detection (`frontend/src/utils/api.ts`)

**Changed:**
- Removed complex inference logic
- Always uses known production backend URL: `https://cep-backend-hjfu.onrender.com`
- Simplified logic for production

**Before:**
```typescript
// Tried to infer backend URL from frontend URL
if (hostname.includes('frontend')) {
  const inferredBackendUrl = origin.replace('frontend', 'backend');
  // This gave wrong URL: cep-backend-vy68.onrender.com
}
```

**After:**
```typescript
// Always use known production backend URL
const knownBackendUrl = 'https://cep-backend-hjfu.onrender.com';
console.log('Using known production backend URL:', knownBackendUrl);
return knownBackendUrl;
```

### 2. CORS Configuration (`backend/middleware/cors.js`)

**Already configured correctly:**
- ✅ Allows all `.onrender.com` domains
- ✅ Uses `CLIENT_ORIGIN` from environment variables
- ✅ Pattern matching for Render domains

## Verification

### Step 1: Check Browser Console

After deployment, open frontend and check console. You should see:
```
Detected hostname: cep-frontend-vy68.onrender.com
Detected origin: https://cep-frontend-vy68.onrender.com
Using known production backend URL: https://cep-backend-hjfu.onrender.com
```

### Step 2: Test API Call

In browser console, run:
```javascript
fetch('https://cep-backend-hjfu.onrender.com/api/home')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{message: "CEP Backend Server is running!"}` (no CORS errors)

### Step 3: Check Network Tab

1. Open DevTools (F12) → Network tab
2. Refresh the page
3. Look for API calls to `https://cep-backend-hjfu.onrender.com`
4. Should return 200 OK (not 404 or CORS errors)

## Backend CORS Configuration

The backend CORS is configured to allow:
- ✅ All `.onrender.com` domains (pattern matching)
- ✅ `CLIENT_ORIGIN` from environment variables
- ✅ All localhost origins for development

**CORS should work automatically** for all Render domains.

## Summary

✅ **Fixed backend URL** - Always uses `https://cep-backend-hjfu.onrender.com`
✅ **Simplified detection** - No more complex inference logic
✅ **CORS configured** - Backend allows all Render domains
✅ **Better logging** - Shows which backend URL is being used

**The CORS and 404 errors should now be fixed!**

The frontend will now correctly connect to `https://cep-backend-hjfu.onrender.com` and CORS should allow the requests.

