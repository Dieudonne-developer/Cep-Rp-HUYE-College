# 🔧 Quick Fix: Set Email Credentials on Render

## Problem
The backend logs show:
```
Email configuration missing - EMAIL_USER or EMAIL_APP_PASSWORD not set
EMAIL_USER configured: false
EMAIL_APP_PASSWORD configured: false
```

## Solution: Set Environment Variables in Render

### Step 1: Go to Render Dashboard
1. Open [Render Dashboard](https://dashboard.render.com/)
2. Click on your **`cep-backend`** service

### Step 2: Navigate to Environment Tab
1. Click on **"Environment"** in the left sidebar
2. Scroll down to the **"Environment Variables"** section

### Step 3: Add Email Credentials
Click **"Add Environment Variable"** and add these two variables:

**Variable 1:**
- **Key**: `EMAIL_USER`
- **Value**: `cep.rp.huye@gmail.com`
- Click **"Save Changes"**

**Variable 2:**
- **Key**: `EMAIL_APP_PASSWORD`
- **Value**: `nsfualtegcvvxoec`
- Click **"Save Changes"**

> **Important**: The app password should be entered **without spaces** (16 characters: `nsfualtegcvvxoec`)

### Step 4: Redeploy (Automatic)
- Render will **automatically redeploy** your service after saving environment variables
- Wait for the deployment to complete (usually 2-3 minutes)
- You'll see a green checkmark when it's done

### Step 5: Verify
After redeployment, check the logs:
1. Go to **"Logs"** tab in Render
2. Look for: `✅ Connected to MongoDB successfully!`
3. Try registering a new user or requesting password reset
4. You should see: `Email transporter verified successfully` instead of the error

## Expected Log Output (After Fix)
```
✅ Connected to MongoDB successfully!
Email transporter verified successfully
Verification email sent successfully: <message-id>
```

## Troubleshooting

### Still seeing "Email configuration missing"?
1. **Double-check variable names**: Must be exactly `EMAIL_USER` and `EMAIL_APP_PASSWORD` (case-sensitive)
2. **Verify no extra spaces**: Check that values don't have leading/trailing spaces
3. **Wait for redeploy**: Changes take effect after redeployment completes
4. **Check logs**: Look for any errors during deployment

### Email still not sending?
1. **Verify Gmail App Password**: Make sure the app password is still valid
2. **Check Gmail Settings**: Ensure 2-Step Verification is enabled
3. **Check Render Logs**: Look for specific error messages (EAUTH, ECONNECTION, etc.)

## Quick Reference

**Environment Variables to Set:**
```
EMAIL_USER=cep.rp.huye@gmail.com
EMAIL_APP_PASSWORD=nsfualtegcvvxoec
```

**Render Service:** `cep-backend`  
**Render URL:** https://cep-backend-hjfu.onrender.com

---

**Note**: The code automatically removes spaces from the app password, but it's best to set it correctly without spaces.

