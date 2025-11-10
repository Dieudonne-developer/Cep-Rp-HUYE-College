# 🔧 Email Error Fix Guide

## ❌ Current Error
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

## ✅ Solution: Generate Gmail App Password

The `.env` file currently has `EMAIL_APP_PASSWORD=REPLACE_WITH_GMAIL_APP_PASSWORD`, which is a placeholder. You need to replace this with a real Gmail App Password.

## 📝 Step-by-Step Instructions

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to https://myaccount.google.com/security
2. Click on **"2-Step Verification"** (scroll down to find it)
3. Follow the prompts to enable 2-factor authentication
   - You'll need your phone number
   - Google will send you a verification code
   - Enter the code to complete setup

### Step 2: Generate App Password

1. Go back to: https://myaccount.google.com/security
2. Scroll down to **"Signing in to Google"** section
3. Click on **"App passwords"** (right next to "2-Step Verification")
4. You may be asked to sign in again
5. Select:
   - **App**: Choose "Mail"
   - **Device**: Choose "Other (Custom name)"
6. Enter the name: `CEP Choir System`
7. Click **"Generate"**
8. Google will show you a **16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File

1. Open the file: `backend/.env`
2. Find this line:
   ```
   EMAIL_APP_PASSWORD=REPLACE_WITH_GMAIL_APP_PASSWORD
   ```
3. Replace `REPLACE_WITH_GMAIL_APP_PASSWORD` with the 16-character password you copied
4. **IMPORTANT**: Remove the spaces from the password
   - Example: If Google shows `abcd efgh ijkl mnop`, write `abcdefghijklmnop`
5. Your `.env` should look like this:
   ```
   EMAIL_USER=elyseemusabyimana5@gmail.com
   EMAIL_APP_PASSWORD=abcdefghijklmnop
   ```
6. Save the file

### Step 4: Restart Your Server

1. Stop your current server (Ctrl+C in the terminal)
2. Start it again:
   ```powershell
   cd backend
   npm start
   ```

### Step 5: Test Registration

1. Go to: http://172.16.12.113:5173/choir/register
2. Try registering with your Gmail
3. Check your Gmail inbox for the verification email
4. Click the link in the email to set your password

## 🔍 Troubleshooting

### If you still don't receive emails:

1. **Check Spam Folder**: Look in Spam/Junk
2. **Verify App Password**: Make sure there are no spaces in the password
3. **Check Email Address**: Make sure `EMAIL_USER` matches the Gmail account where you generated the app password
4. **Check Server Logs**: Look at your terminal for any error messages

### Common Issues:

- ❌ **"2-Step Verification not enabled"**: You must enable 2FA before generating app passwords
- ❌ **"Cannot find App passwords"**: Make sure 2FA is enabled first
- ❌ **"Invalid login" error**: The app password might be incorrect, regenerate it
- ❌ **Password has spaces**: Remove all spaces from the 16-character password

## 📌 Important Notes

- ✅ App passwords are **16 characters without spaces** (ignore the spaces Google shows)
- ✅ You can generate multiple app passwords for different apps
- ✅ Your regular Gmail password will NOT work - you MUST use an app password
- ✅ App passwords are more secure than your regular password
- ✅ If you change your Gmail password, app passwords still work

## 🎯 Quick Reference

**Email Configuration in .env:**
```env
EMAIL_USER=elyseemusabyimana5@gmail.com
EMAIL_APP_PASSWORD=YOUR_16_CHAR_APP_PASSWORD_WITHOUT_SPACES
```

**Gmail Security Settings:**
- URL: https://myaccount.google.com/security
- Enable: 2-Step Verification
- Generate: App passwords → Mail → Other (Custom name)

---

**Once you complete these steps, emails will be sent successfully!** ✅

