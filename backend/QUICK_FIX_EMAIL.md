# 🚨 QUICK FIX: Email Not Working

## Problem
You're getting: **"Registration successful!"** but NO email arrives.

## Root Cause
The `.env` file has a placeholder password: `EMAIL_APP_PASSWORD=REPLACE_WITH_GMAIL_APP_PASSWORD`

## Solution (5 Minutes)

### 1️⃣ Enable 2FA on Gmail
- Go to: https://myaccount.google.com/security
- Enable "2-Step Verification"

### 2️⃣ Generate App Password
- At the same page, click "App passwords"
- Select: Mail → Other → Name: "CEP Choir"
- Copy the 16-character password

### 3️⃣ Update .env File
Open `backend/.env` and replace:
```env
EMAIL_APP_PASSWORD=YOUR_16_CHAR_PASSWORD_WITHOUT_SPACES
```

### 4️⃣ Restart Server
```powershell
# Stop server (Ctrl+C)
cd backend
npm start
```

### 5️⃣ Test
- Go to: http://172.16.12.113:5173/choir/register
- Register → Check Gmail inbox

---

**That's it!** ✅

For detailed instructions, see: `EMAIL_ERROR_FIX_GUIDE.md`

