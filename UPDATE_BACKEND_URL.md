# Update Backend URL Configuration

## Current URLs

- **Backend URL**: `https://cep-backend-hjfu.onrender.com` ✅ (Verified working)
- **Frontend URL**: (Please provide the actual frontend URL)

## Changes Made

### 1. Updated API URL Detection (`frontend/src/utils/api.ts`)

**Added hardcoded backend URL** for Render deployment:
- When on Render (`.onrender.com`), uses: `https://cep-backend-hjfu.onrender.com`
- This ensures the frontend always connects to the correct backend

### 2. Priority Order

The API URL detection now works in this order:
1. **VITE_API_BASE_URL** (from environment variable at build time) - Highest priority
2. **Known backend URL** (hardcoded for Render) - Used when on Render
3. **Inferred URL** (from frontend URL pattern) - Fallback
4. **Localhost** (for local development) - Last resort

## Verification

### Test Backend
```bash
curl https://cep-backend-hjfu.onrender.com/api/home
```
**Expected**: `{"message":"CEP Backend Server is running!"}` ✅

### Test Frontend-Backend Communication

1. **Open frontend in browser**
2. **Open browser console** (F12)
3. **Check logs** - Should see:
   ```
   Detected hostname: cep-frontend-xxx.onrender.com
   Using known backend URL: https://cep-backend-hjfu.onrender.com
   ```

4. **Test API call** in console:
   ```javascript
   fetch('https://cep-backend-hjfu.onrender.com/api/home')
     .then(r => r.json())
     .then(console.log)
   ```
   **Expected**: `{message: "CEP Backend Server is running!"}`

## Next Steps

### If Frontend URL is Different

If your frontend URL is different (e.g., `https://cep-frontend-vy68.onrender.com`), you need to:

1. **Update `render.yaml`** to ensure service names match:
   ```yaml
   services:
     - name: cep-frontend  # Should match your actual service name
     - name: cep-backend   # Should match your actual service name
   ```

2. **Set CORS in backend** - Add frontend URL to allowed origins:
   - Go to Render Dashboard → `cep-backend` → Environment
   - Set `CLIENT_ORIGIN` = `https://cep-frontend-xxx.onrender.com`

3. **Set API URL in frontend** (if using Blueprint):
   - `render.yaml` should auto-set `VITE_API_BASE_URL` from backend service
   - Or set manually in Render Dashboard → `cep-frontend` → Environment

## Summary

✅ **Backend URL hardcoded**: `https://cep-backend-hjfu.onrender.com`
✅ **Backend verified working**: Returns correct response
✅ **Frontend will use this URL** when on Render

**The frontend should now communicate with the backend correctly!**

Please provide the actual frontend URL so we can:
1. Update CORS configuration
2. Verify the connection
3. Update any remaining configuration

