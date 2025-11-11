# Backend URL Configuration

## Current Configuration

### Backend URL
- **Production**: `https://cep-backend-hjfu.onrender.com`
- **Status**: ✅ Confirmed working (returns `{"message":"CEP Backend Server is running!"}`)

### Frontend URL
- **Production**: `https://cep-frontend-xxx.onrender.com` (your actual frontend URL)

## API URL Detection Logic

The frontend uses `getApiBaseUrl()` function which:

1. **First Priority**: Uses `VITE_API_BASE_URL` environment variable (set at build time)
2. **Second Priority**: Detects Render environment and infers backend URL
3. **Fallback**: Uses known production backend URL: `https://cep-backend-hjfu.onrender.com`
4. **Local Development**: Falls back to `http://localhost:4000`

## How It Works

### On Render (Production)
When the frontend detects it's running on Render (hostname contains `.onrender.com`):

1. Tries to infer backend URL from frontend URL:
   - Removes `-1` suffix: `cep-frontend-1.onrender.com` → `cep-frontend.onrender.com`
   - Replaces `frontend` with `backend`: `cep-frontend-xxx.onrender.com` → `cep-backend-xxx.onrender.com`

2. If inference matches known backend URL, uses it
3. Otherwise, uses the known production backend URL: `https://cep-backend-hjfu.onrender.com`

### Environment Variable (Recommended)
The best approach is to set `VITE_API_BASE_URL` in `render.yaml`:

```yaml
envVars:
  - key: VITE_API_BASE_URL
    fromService:
      type: web
      name: cep-backend
      property: url
```

This ensures the backend URL is set at build time and embedded in the frontend bundle.

## Verification

### Test Backend
```bash
curl https://cep-backend-hjfu.onrender.com/api/home
```

**Expected Response:**
```json
{"message":"CEP Backend Server is running!"}
```

### Test from Frontend
Open browser console on frontend and run:
```javascript
fetch('https://cep-backend-hjfu.onrender.com/api/home')
  .then(r => r.json())
  .then(console.log)
```

Should return the same message without CORS errors.

## Summary

✅ **Backend URL**: `https://cep-backend-hjfu.onrender.com` (confirmed working)
✅ **API Detection**: Multiple fallback strategies
✅ **Known URL**: Hardcoded fallback for production
✅ **Environment Variable**: Recommended for build-time configuration

The frontend will now correctly connect to the backend on Render!

