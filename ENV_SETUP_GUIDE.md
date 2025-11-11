# Environment Variables Setup Guide

## Important Notes

### ⚠️ For Render Deployment
**DO NOT rely on `.env` file for production!** 

On Render, environment variables are set through:
1. **Render Dashboard** → Service → Environment tab
2. **render.yaml** (for Blueprint deployments)

The `.env` file is **only for local development**.

## Environment Variables Required

### 1. NODE_ENV
- **Value**: `production`
- **Purpose**: Sets Node.js to production mode
- **Set in**: Render Dashboard or `render.yaml`

### 2. PORT
- **Value**: `10000` (or Render-assigned port)
- **Purpose**: Port the backend server listens on
- **Set in**: Render Dashboard or `render.yaml`
- **Note**: Render may assign a different port automatically

### 3. MONGODB_URI
- **Value**: Your MongoDB connection string
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Set in**: Render Dashboard → Environment → Add `MONGODB_URI`
- **⚠️ CRITICAL**: This must be set manually in Render Dashboard

### 4. CLIENT_ORIGIN
- **Value**: `https://cep-frontend-vy68.onrender.com` (your frontend URL)
- **Purpose**: CORS origin - allows frontend to make requests
- **Set in**: `render.yaml` (auto-populated from frontend service)
- **Note**: Should match your actual frontend URL exactly

### 5. BACKEND_URL
- **Value**: `https://cep-backend-hjfu.onrender.com` (your backend URL)
- **Purpose**: Backend URL for internal references
- **Set in**: `render.yaml` (auto-populated from backend service)
- **Note**: Should match your actual backend URL exactly

## Setup Instructions

### For Local Development

1. **Copy `.env.example` to `.env`**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file** with your local values:
   ```env
   NODE_ENV=development
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/cep_database
   CLIENT_ORIGIN=http://localhost:5173
   BACKEND_URL=http://localhost:4000
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

### For Render Deployment

#### Option 1: Using Blueprint (render.yaml)
The `render.yaml` file automatically sets:
- ✅ `NODE_ENV`: `production`
- ✅ `PORT`: `10000`
- ✅ `CLIENT_ORIGIN`: Auto-populated from frontend service
- ✅ `BACKEND_URL`: Auto-populated from backend service

**You must manually set**:
- ⚠️ `MONGODB_URI`: Go to Render Dashboard → `cep-backend` → Environment → Add

#### Option 2: Manual Service Configuration
1. Go to Render Dashboard → `cep-backend` service
2. Go to **Environment** tab
3. Click **Add Environment Variable**
4. Add each variable:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `your-mongodb-connection-string`
   - `CLIENT_ORIGIN`: `https://cep-frontend-vy68.onrender.com`
   - `BACKEND_URL`: `https://cep-backend-hjfu.onrender.com`
5. Click **Save Changes**

## Current render.yaml Configuration

```yaml
services:
  - type: web
    name: cep-backend
    env: docker
    rootDir: backend
    plan: free
    dockerfilePath: Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false  # ⚠️ Must be set manually in Render Dashboard
      - key: CLIENT_ORIGIN
        fromService:
          type: web
          name: cep-frontend
          property: url  # ✅ Auto-populated
      - key: BACKEND_URL
        fromService:
          type: web
          name: cep-backend
          property: url  # ✅ Auto-populated
```

## Verification

### Check Environment Variables in Render
1. Go to Render Dashboard → `cep-backend` service
2. Go to **Environment** tab
3. Verify all variables are set:
   - ✅ `NODE_ENV`: `production`
   - ✅ `PORT`: `10000`
   - ✅ `MONGODB_URI`: Your MongoDB connection string
   - ✅ `CLIENT_ORIGIN`: Frontend URL
   - ✅ `BACKEND_URL`: Backend URL

### Test Backend Connection
```bash
curl https://cep-backend-hjfu.onrender.com/api/home
```

**Expected Response**:
```json
{
  "message": "CEP Backend Server is running!"
}
```

### Test Frontend-Backend Communication
1. Open frontend: `https://cep-frontend-vy68.onrender.com`
2. Check browser console for API calls
3. Should see successful requests to backend
4. No CORS errors

## Troubleshooting

### Issue: CORS Errors
**Symptoms**: Frontend can't make requests to backend
**Solution**:
- Verify `CLIENT_ORIGIN` matches frontend URL exactly
- Check that URL includes `https://` protocol
- Ensure no trailing slashes

### Issue: MongoDB Connection Failed
**Symptoms**: Server starts but can't connect to database
**Solution**:
- Verify `MONGODB_URI` is set correctly in Render Dashboard
- Check MongoDB network access (IP whitelist)
- Verify credentials are correct

### Issue: Environment Variables Not Loading
**Symptoms**: Server uses default values instead of env vars
**Solution**:
- Check Render Dashboard → Environment tab
- Verify variables are set (not just in `render.yaml`)
- Restart the service after adding variables

## Summary

✅ **Created `.env` file** for local development
✅ **Created `.env.example`** as a template
✅ **Updated `render.yaml`** with correct configuration
✅ **Documented setup process** for both local and Render

**For Render**: Set `MONGODB_URI` manually in Dashboard
**For Local**: Use `.env` file with local values

