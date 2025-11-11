# Backend Deployment Configuration - Complete Guide

## Current Configuration

### render.yaml
```yaml
services:
  - type: web
    name: cep-backend
    env: node
    rootDir: backend
    plan: free
    dockerfilePath: backend/Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: CLIENT_ORIGIN
        fromService:
          type: web
          name: cep-frontend
          property: url
      - key: BACKEND_URL
        fromService:
          type: web
          name: cep-backend
          property: url
```

## Configuration Details

### Service Type
- **Type**: `web` - Web Service (runs continuously)
- **Environment**: `node` - Uses Node.js runtime
- **Root Directory**: `backend` - All paths relative to this directory
- **Plan**: `free` - Free tier

### Dockerfile Path
- **Path**: `backend/Dockerfile`
- **Note**: Since `rootDir: backend` is set, this path is resolved from the repo root

### Environment Variables

#### 1. NODE_ENV
- **Value**: `production`
- **Purpose**: Sets Node.js to production mode
- **Used for**: Optimizations, error handling, logging

#### 2. PORT
- **Value**: `10000`
- **Purpose**: Port the backend server listens on
- **Note**: Render automatically assigns a port, but this sets the default
- **Used in**: `backend/server.js` - `const PORT = process.env.PORT || 4000`

#### 3. MONGODB_URI
- **Value**: `sync: false` (must be set manually)
- **Purpose**: MongoDB connection string
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **How to Set**:
  1. Go to Render Dashboard → `cep-backend` service
  2. Go to **Environment** tab
  3. Click **Add Environment Variable**
  4. Key: `MONGODB_URI`
  5. Value: Your MongoDB connection string
  6. Click **Save Changes**

#### 4. CLIENT_ORIGIN
- **Value**: Auto-populated from `cep-frontend` service URL
- **Purpose**: CORS origin for frontend requests
- **Format**: `https://cep-rp-huye-college-1.onrender.com`
- **Used in**: CORS middleware to allow frontend requests

#### 5. BACKEND_URL
- **Value**: Auto-populated from `cep-backend` service URL
- **Purpose**: Backend URL for internal references
- **Format**: `https://cep-rp-huye-college.onrender.com`
- **Used in**: API responses, WebSocket connections

## Dockerfile Configuration

### Build Process
1. **Base Image**: `node:20-alpine` (lightweight Node.js 20)
2. **Working Directory**: `/app`
3. **Dependencies**: Installs production dependencies only
4. **Source**: Copies backend source code
5. **Port**: Exposes port 4000 (or PORT from env)
6. **Start Command**: `node server.js`

### Dockerfile Structure
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "server.js"]
```

## Deployment Checklist

### Before Deployment
- [ ] MongoDB database created and accessible
- [ ] MongoDB connection string ready
- [ ] Environment variables configured in Render
- [ ] `render.yaml` committed to repository
- [ ] Backend code tested locally

### During Deployment
- [ ] Render clones repository
- [ ] Builds Docker image from `backend/Dockerfile`
- [ ] Installs dependencies
- [ ] Starts server on port 10000 (or assigned port)
- [ ] Health check passes

### After Deployment
- [ ] Backend URL accessible: `https://cep-rp-huye-college.onrender.com`
- [ ] Health endpoint works: `/api/home` or `/health`
- [ ] CORS allows frontend requests
- [ ] MongoDB connection successful
- [ ] API endpoints respond correctly

## Manual Service Configuration (If Not Using Blueprint)

If creating the service manually in Render Dashboard:

1. **New** → **Web Service**
2. Connect GitHub repository
3. Configure:
   - **Name**: `cep-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Plan**: `Free`
4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `your-mongodb-connection-string`
   - `CLIENT_ORIGIN`: `https://cep-rp-huye-college-1.onrender.com` (frontend URL)
   - `BACKEND_URL`: `https://cep-rp-huye-college.onrender.com` (will be auto-set)
5. Click **Create Web Service**

## Verification

### Test Backend Health
```bash
curl https://cep-rp-huye-college.onrender.com/api/home
```

**Expected Response**:
```json
{
  "message": "CEP Backend Server is running!"
}
```

### Test CORS
```bash
curl -H "Origin: https://cep-rp-huye-college-1.onrender.com" \
     https://cep-rp-huye-college.onrender.com/api/home
```

**Expected**: Should return data (CORS headers present)

### Check Logs
In Render Dashboard → `cep-backend` → **Logs**:
- Should see: "Server running on port..."
- Should see: "MongoDB connected" (if connection successful)
- No errors

## Common Issues

### Issue 1: MongoDB Connection Failed
**Symptoms**: Server starts but can't connect to database
**Solution**: 
- Verify `MONGODB_URI` is set correctly
- Check MongoDB network access (IP whitelist)
- Verify credentials are correct

### Issue 2: CORS Errors
**Symptoms**: Frontend can't make requests to backend
**Solution**:
- Verify `CLIENT_ORIGIN` matches frontend URL exactly
- Check CORS middleware configuration
- Ensure frontend URL includes protocol (`https://`)

### Issue 3: Port Conflicts
**Symptoms**: Server fails to start
**Solution**:
- Render assigns ports automatically
- Use `process.env.PORT` in code (don't hardcode)
- Verify `PORT` env var is set

### Issue 4: Build Fails
**Symptoms**: Docker build fails
**Solution**:
- Check `backend/Dockerfile` exists
- Verify `package.json` is correct
- Check `.dockerignore` excludes unnecessary files

## Summary

✅ **Service Type**: Web Service (Docker)
✅ **Root Directory**: `backend`
✅ **Dockerfile**: `backend/Dockerfile`
✅ **Port**: 10000 (or Render-assigned)
✅ **Environment Variables**: All configured
✅ **CORS**: Configured for frontend
✅ **MongoDB**: Connection string required

**The backend is ready for deployment!**

