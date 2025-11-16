# Render Environment Variables Setup Guide

## Quick Setup for Render Deployment

This guide shows you how to set up all environment variables for your CEP backend on Render.

## Step 1: Access Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your **cep-backend** service
3. Navigate to the **Environment** tab

## Step 2: Add Environment Variables

Copy and paste each variable below into Render Dashboard:

```
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
```

```
NODE_ENV=production
```

```
EMAIL_USER=cep.rp.huye@gmail.com
```

```
EMAIL_APP_PASSWORD=eygpnyeszsbbasoo
```

```
CLIENT_ORIGIN=https://cep-rp-huye-college.vercel.app
```

```
FRONTEND_URL=https://cep-rp-huye-college.vercel.app
```

```
JWT_SECRET=cep-jwt-secret-key-change-this-to-random-string
```

```
MAX_FILE_SIZE=104857600
```

```
UPLOAD_PATH=./uploads
```

```
DEBUG_CORS=false
```

## Step 3: Important Notes

### Variables NOT to Set (Auto-set by Render)

- **PORT**: Automatically set by Render (10000 from render.yaml)
- **BACKEND_URL**: Automatically set by Render (fromService in render.yaml)
- **HOST**: Automatically set by Render (0.0.0.0 for Docker)

### Critical: EMAIL_APP_PASSWORD Format

The `EMAIL_APP_PASSWORD` must be entered **WITHOUT SPACES**:

- ❌ **WRONG**: `eygp nyes zsbb asoo` (with spaces)
- ✅ **CORRECT**: `eygpnyeszsbbasoo` (no spaces)

The code automatically removes spaces, but it's best to set it correctly.

## Step 4: Save and Deploy

1. After adding all variables, click **"Save Changes"**
2. Render will automatically redeploy your service
3. Check the logs to verify the deployment

## Step 5: Verify Email Configuration

After deployment, test email functionality:

1. **Registration Flow**: Register a new user and check if verification link appears (even if email fails due to Render SMTP blocking, the link will be shown in the response)
2. **Password Reset**: Request a password reset and check if verification code appears (even if email fails, the code will be shown in the response)

## Troubleshooting

### Email Still Failing?

Render's free tier blocks SMTP connections. The backend is configured to:
- ✅ Return verification codes/links in API responses when email fails
- ✅ Frontend displays these codes/links prominently when email fails
- ✅ Users can complete registration/password reset even without email

### Connection Timeout?

This is expected on Render's free tier. The fallback mechanism ensures users can still complete their workflows.

### Need to Update Email Credentials?

1. Update `EMAIL_USER` and `EMAIL_APP_PASSWORD` in Render Dashboard
2. Click "Save Changes"
3. Render will automatically redeploy

## All Variables Summary

| Variable | Value | Required | Notes |
|----------|-------|----------|-------|
| `MONGODB_URI` | `mongodb://mongo:...` | ✅ Yes | Railway MongoDB connection |
| `NODE_ENV` | `production` | ✅ Yes | Environment mode |
| `EMAIL_USER` | `cep.rp.huye@gmail.com` | ✅ Yes | Gmail address |
| `EMAIL_APP_PASSWORD` | `eygpnyeszsbbasoo` | ✅ Yes | No spaces! |
| `CLIENT_ORIGIN` | `https://cep-rp-huye-college.vercel.app` | ✅ Yes | Frontend URL for CORS |
| `FRONTEND_URL` | `https://cep-rp-huye-college.vercel.app` | ✅ Yes | Frontend URL for redirects |
| `JWT_SECRET` | Random string | ⚠️ Optional | Change to random string |
| `MAX_FILE_SIZE` | `104857600` | ⚠️ Optional | 100MB in bytes |
| `UPLOAD_PATH` | `./uploads` | ⚠️ Optional | Upload directory |
| `DEBUG_CORS` | `false` | ⚠️ Optional | Enable CORS logging |

## Quick Copy-Paste (All Variables)

For quick setup, you can copy all variables from `RENDER_ENV_VARIABLES.txt` file.

---

**Last Updated**: November 2025  
**Render Service**: cep-backend  
**Backend URL**: https://cep-backend-hjfu.onrender.com  
**Frontend URL**: https://cep-rp-huye-college.vercel.app
