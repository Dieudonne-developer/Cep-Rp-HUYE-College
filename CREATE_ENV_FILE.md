# How to Create .env File for Backend

## Important Notes

⚠️ **For Render Deployment**: Environment variables are set in Render Dashboard, NOT in `.env` file!

The `.env` file is **only for local development**. On Render, use the Dashboard or `render.yaml`.

## Quick Setup

### Step 1: Create .env File

Since `.env` is gitignored, you need to create it manually:

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

   Or create it manually with these contents:

### Step 2: Add Your Values

Create `backend/.env` with these values:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database Configuration
# Replace with your actual MongoDB connection string
MONGODB_URI=your-mongodb-connection-string

# CORS Configuration
CLIENT_ORIGIN=https://cep-frontend-vy68.onrender.com

# Backend URL
BACKEND_URL=https://cep-backend-hjfu.onrender.com
```

## For Render Deployment

### Set Environment Variables in Render Dashboard

1. Go to **Render Dashboard** → `cep-backend` service
2. Go to **Environment** tab
3. Click **Add Environment Variable**
4. Add each variable:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | `your-mongodb-connection-string` |
   | `CLIENT_ORIGIN` | `https://cep-frontend-vy68.onrender.com` |
   | `BACKEND_URL` | `https://cep-backend-hjfu.onrender.com` |

5. Click **Save Changes**
6. Service will automatically redeploy

### Using render.yaml (Blueprint)

The `render.yaml` file already has most variables configured. You only need to:

1. **Set `MONGODB_URI` manually** in Render Dashboard (it's marked as `sync: false`)
2. **Verify service names match**:
   - Frontend service name: `cep-frontend`
   - Backend service name: `cep-backend`

If your actual service names are different (e.g., `cep-frontend-vy68`), update `render.yaml`:

```yaml
envVars:
  - key: CLIENT_ORIGIN
    fromService:
      type: web
      name: cep-frontend-vy68  # Update to match your service name
      property: url
```

## Verification

### Test Backend
```bash
curl https://cep-backend-hjfu.onrender.com/api/home
```

**Expected**: `{"message": "CEP Backend Server is running!"}`

### Test Frontend-Backend Communication
1. Open frontend: `https://cep-frontend-vy68.onrender.com`
2. Check browser console (F12)
3. Should see successful API calls to backend
4. No CORS errors

## Summary

✅ **Created `.env.example`** - Template file (can be committed to git)
✅ **Created setup guide** - Instructions for both local and Render
✅ **render.yaml configured** - Most variables auto-populated

**Next Steps**:
1. Create `.env` file locally (copy from `.env.example`)
2. Set `MONGODB_URI` in Render Dashboard
3. Verify service names match in `render.yaml`
4. Deploy and test!

