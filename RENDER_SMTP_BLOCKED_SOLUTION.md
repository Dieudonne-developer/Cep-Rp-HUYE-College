# ⚠️ Render Free Tier SMTP Blocking - Solution

## Problem
Render's free tier **blocks outbound SMTP connections** to prevent spam. This is why you're seeing:
```
Error: Connection timeout
code: 'ETIMEDOUT'
command: 'CONN'
```

## Current Status
- ✅ Email credentials are correctly configured
- ✅ Code is properly handling timeouts
- ❌ Render is blocking SMTP connections to Gmail

## Solutions

### Option 1: Use Alternative Email Service (Recommended)

Render allows connections to services like **SendGrid**, **Mailgun**, or **AWS SES**. These services are designed for transactional emails and work better with cloud platforms.

#### Quick Setup with SendGrid (Free tier: 100 emails/day)

1. **Sign up for SendGrid**: https://sendgrid.com
2. **Create API Key**: Settings → API Keys → Create API Key
3. **Update Render Environment Variables**:
   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your_api_key_here
   EMAIL_FROM=cep.rp.huye@gmail.com
   ```

4. **Update code** to use SendGrid instead of Gmail SMTP

### Option 2: Upgrade Render Plan

Render's paid plans have better network access and may allow SMTP connections.

### Option 3: Use Different Hosting for Email

- Deploy email sending to a different service (AWS Lambda, Railway, etc.)
- Keep main backend on Render
- Call email service via API

### Option 4: Use Gmail API (OAuth2)

Instead of SMTP, use Gmail API with OAuth2. This requires more setup but may work better.

## Current Code Status

The code has been optimized for Render:
- ✅ Uses port 465 (SSL) instead of 587 (TLS)
- ✅ Extended timeouts (30 seconds)
- ✅ Retry logic (2 attempts)
- ✅ Graceful timeout handling
- ✅ Better error messages

However, **Render still blocks the connection** at the network level.

## Immediate Workaround

For now, the system will:
1. ✅ Generate verification codes correctly
2. ✅ Store codes in memory (10-minute expiration)
3. ❌ Cannot send emails due to Render blocking

**Users can still reset passwords** if you provide the verification code through another channel (admin dashboard, manual email, etc.)

## Recommended Next Steps

1. **Short-term**: Implement SendGrid or Mailgun (15-30 minutes setup)
2. **Long-term**: Consider upgrading Render plan or using dedicated email service

## Testing Email Locally

Email works fine locally - the issue is **only on Render's free tier**.

To test locally:
```bash
cd backend
# Set EMAIL_USER and EMAIL_APP_PASSWORD in .env
npm start
# Test forgot-password - emails will send successfully
```

## Alternative: Manual Code Delivery

Until email is fixed, you could:
1. Show verification code on screen (for testing)
2. Create admin endpoint to view pending codes
3. Manually send codes via Gmail web interface

Would you like me to implement SendGrid integration? It's the fastest solution.

