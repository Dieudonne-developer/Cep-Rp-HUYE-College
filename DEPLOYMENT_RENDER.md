# Render Deployment Guide

This guide explains how to deploy the CEP RP Huye application on Render.

## Services Overview

The application consists of two services:
1. **Backend** (Web Service): Node.js/Express API
2. **Frontend** (Static Site): React/Vite application

## Render URLs

- **Backend URL**: `https://cep-rp-huye-college.onrender.com`
- **Frontend URL**: `https://cep-rp-huye-college-1.onrender.com`

## Environment Variables

### Backend Service (`cep-backend`)

Set these environment variables in Render Dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Server port (Render sets this automatically) |
| `MONGODB_URI` | `your-mongodb-connection-string` | MongoDB connection string |
| `CLIENT_ORIGIN` | `https://cep-rp-huye-college-1.onrender.com` | Frontend URL for CORS |
| `FRONTEND_URL` | `https://cep-rp-huye-college-1.onrender.com` | Frontend URL (optional) |
| `BACKEND_URL` | `https://cep-rp-huye-college.onrender.com` | Backend URL (optional) |

**Note**: If using `render.yaml` blueprint, `CLIENT_ORIGIN` and `BACKEND_URL` are automatically wired from the frontend service.

### Frontend Service (`cep-frontend`)

Set these environment variables in Render Dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_API_BASE_URL` | `https://cep-rp-huye-college.onrender.com` | Backend API URL |

**Note**: If using `render.yaml` blueprint, `VITE_API_BASE_URL` is automatically wired from the backend service.

## Deployment Steps

### Option 1: Using render.yaml Blueprint (Recommended)

1. Push your code to GitHub
2. In Render Dashboard, go to "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and create both services
5. Set the `MONGODB_URI` environment variable manually in the backend service
6. Deploy

### Option 2: Manual Service Creation

#### Backend Service

1. In Render Dashboard, go to "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `cep-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Dockerfile Path**: `backend/Dockerfile`
4. Set environment variables (see above)
5. Deploy

#### Frontend Service

1. In Render Dashboard, go to "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `cep-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Set environment variables (see above)
5. Deploy

## Troubleshooting

### Frontend can't connect to backend

1. Verify `VITE_API_BASE_URL` is set to the backend URL in frontend service
2. Verify `CLIENT_ORIGIN` is set to the frontend URL in backend service
3. Check browser console for CORS errors
4. Verify backend service is running and accessible

### CORS Errors

1. Ensure `CLIENT_ORIGIN` in backend matches the exact frontend URL
2. Check backend logs for CORS rejection messages
3. Verify Socket.IO CORS configuration allows the frontend URL

### Build Failures

1. **Frontend build fails**: 
   - Verify Node.js version is compatible (check `frontend/package.json`)
   - Check build logs for missing dependencies
   - Ensure `dist` directory is created after build

2. **Backend build fails**:
   - Verify Dockerfile is correct
   - Check MongoDB connection string is valid
   - Verify all dependencies are in `package.json`

### Socket.IO Connection Issues

1. Verify Socket.IO CORS allows the frontend URL
2. Check that WebSocket connections are not blocked
3. Verify backend is running and Socket.IO is initialized

## Verification

After deployment, verify:

1. Backend health check: `https://cep-rp-huye-college.onrender.com/api/home`
   - Should return: `{"message":"CEP Backend Server is running!"}`

2. Frontend loads: `https://cep-rp-huye-college-1.onrender.com`
   - Should display the homepage

3. API connection: Open browser console on frontend
   - Should see successful API calls to backend
   - No CORS errors

## Environment Variables in render.yaml

The `render.yaml` file automatically wires environment variables between services:

- `CLIENT_ORIGIN` in backend ← Frontend service URL
- `BACKEND_URL` in backend ← Backend service URL  
- `VITE_API_BASE_URL` in frontend ← Backend service URL

You only need to manually set `MONGODB_URI` in the backend service.

## Notes

- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may be slow (cold start)
- Consider upgrading to paid tier for always-on services
- MongoDB Atlas free tier is recommended for database hosting

