# Render Deployment Fix Checklist

## Current URLs
- **Backend**: `https://cep-rp-huye-college.onrender.com`
- **Frontend**: `https://cep-rp-huye-college-1.onrender.com`

## Issues Fixed in Code

1. ✅ **Socket.IO CORS Configuration**: Updated to allow Render URLs (`.onrender.com` domains)
2. ✅ **Dockerfile**: Fixed duplicate FROM statements
3. ✅ **CORS Middleware**: Already configured to allow Render URLs

## Required Environment Variables on Render

### Backend Service (`cep-backend`)

Go to Render Dashboard → Your Backend Service → Environment → Add the following:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (or leave Render's default) |
| `MONGODB_URI` | `your-mongodb-connection-string` |
| `CLIENT_ORIGIN` | `https://cep-rp-huye-college-1.onrender.com` |
| `FRONTEND_URL` | `https://cep-rp-huye-college-1.onrender.com` |
| `BACKEND_URL` | `https://cep-rp-huye-college.onrender.com` |

### Frontend Service (`cep-frontend`)

Go to Render Dashboard → Your Frontend Service → Environment → Add the following:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://cep-rp-huye-college.onrender.com` |

## Deployment Steps

### Step 1: Push Latest Code to GitHub

```bash
git add .
git commit -m "Fix Socket.IO CORS and Dockerfile for Render deployment"
git push origin main
```

### Step 2: Verify Environment Variables

1. **Backend Service**:
   - Go to Render Dashboard
   - Select `cep-backend` service
   - Go to "Environment" tab
   - Verify all environment variables are set (see above)
   - **Critical**: Ensure `CLIENT_ORIGIN` is exactly `https://cep-rp-huye-college-1.onrender.com`

2. **Frontend Service**:
   - Go to Render Dashboard
   - Select `cep-frontend` service
   - Go to "Environment" tab
   - Verify `VITE_API_BASE_URL` is set to `https://cep-rp-huye-college.onrender.com`

### Step 3: Redeploy Services

1. **Redeploy Backend First**:
   - Go to backend service → "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete
   - Check logs for any errors

2. **Redeploy Frontend**:
   - Go to frontend service → "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment to complete
   - Check logs for any errors

### Step 4: Verify Deployment

1. **Test Backend**:
   - Open: `https://cep-rp-huye-college.onrender.com/api/home`
   - Should return: `{"message":"CEP Backend Server is running!"}`

2. **Test Frontend**:
   - Open: `https://cep-rp-huye-college-1.onrender.com`
   - Should load the homepage
   - Open browser console (F12)
   - Check for any errors

3. **Test API Connection**:
   - On frontend page, open browser console
   - Should see successful API calls to backend
   - No CORS errors should appear

## Common Issues and Solutions

### Issue: CORS Error in Browser Console

**Solution**:
1. Verify `CLIENT_ORIGIN` in backend matches frontend URL exactly
2. Check backend logs for CORS rejection messages
3. Ensure backend service is running

### Issue: "Failed to fetch" or Network Error

**Solution**:
1. Verify `VITE_API_BASE_URL` in frontend is set correctly
2. Verify backend service is running and accessible
3. Check backend URL in browser: `https://cep-rp-huye-college.onrender.com/api/home`

### Issue: Socket.IO Connection Failed

**Solution**:
1. Verify Socket.IO CORS allows the frontend URL (already fixed in code)
2. Check browser console for Socket.IO errors
3. Verify backend is running and Socket.IO is initialized

### Issue: Frontend Build Fails

**Solution**:
1. Check build logs in Render
2. Verify `buildCommand` is: `npm install && npm run build`
3. Verify `staticPublishPath` is: `dist`
4. Verify `rootDir` is: `frontend`

### Issue: Backend Build Fails

**Solution**:
1. Check build logs in Render
2. Verify `Dockerfile` path is: `backend/Dockerfile`
3. Verify `rootDir` is: `backend`
4. Verify MongoDB connection string is valid

## Using render.yaml Blueprint (Alternative)

If you want to use the `render.yaml` blueprint instead of manual configuration:

1. Delete existing services on Render
2. Go to "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically create both services with environment variables wired
5. **Still need to manually set**: `MONGODB_URI` in backend service

## Verification Commands

### Test Backend API
```bash
curl https://cep-rp-huye-college.onrender.com/api/home
```

Expected response:
```json
{"message":"CEP Backend Server is running!"}
```

### Test Frontend
Open in browser:
```
https://cep-rp-huye-college-1.onrender.com
```

### Check Browser Console
1. Open frontend URL in browser
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Should see no CORS errors
5. Should see successful API calls

## Next Steps After Deployment

1. ✅ Verify backend is accessible
2. ✅ Verify frontend loads correctly
3. ✅ Verify API calls work from frontend
4. ✅ Verify Socket.IO connections work
5. ✅ Test user registration and login
6. ✅ Test admin functions
7. ✅ Test chat functionality

## Support

If issues persist:
1. Check Render service logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Verify MongoDB connection is working
5. Check Render service status (may be spinning down on free tier)

