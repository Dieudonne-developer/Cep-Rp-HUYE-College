# 🔧 Fix: Gmail SMTP Connection Timeout on Render

## Problem
Render logs show:
```
Email transporter verification failed: Error: Connection timeout
code: 'ETIMEDOUT'
command: 'CONN'
```

This is a common issue with Render's free tier - network restrictions may cause SMTP connection timeouts.

## Solution Applied

### 1. Enhanced SMTP Configuration
- **Increased timeouts**: 20 seconds (was 10 seconds)
- **Added TLS options**: Better certificate handling
- **Disabled connection pooling**: Better compatibility with Render
- **Extended send timeout**: 30 seconds for email sending

### 2. Verification Timeout Handling
- Verification step now has a 5-second timeout
- If verification times out, email sending is still attempted
- This is common on Render and doesn't prevent emails from being sent

### 3. Updated Email Credentials
- **Email**: `cep.rp.huye@gmail.com`
- **App Password**: `eygpnyeszsbbasoo` (remove spaces from: eygp nyes zsbb asoo)

## Current Configuration

The email transporter is now configured with:
```javascript
{
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  connectionTimeout: 20000, // 20 seconds
  greetingTimeout: 20000,
  socketTimeout: 20000,
  pool: false // Better Render compatibility
}
```

## What to Expect

### After Deployment:
1. **Verification may timeout** - This is normal on Render, emails will still send
2. **Email sending may take longer** - Up to 30 seconds due to Render network
3. **Logs will show**: "Verification timed out (common on Render), attempting to send email anyway..."

### If Emails Still Don't Send:

1. **Check Render Logs** for specific error codes:
   - `EAUTH`: Authentication failed (check credentials)
   - `ECONNECTION`: Cannot connect (Render network issue)
   - `ETIMEDOUT`: Timeout (may need to retry)

2. **Alternative Solutions**:
   - Consider using a paid Render plan (better network access)
   - Use a different email service (SendGrid, Mailgun, etc.)
   - Use a different hosting provider for email sending

3. **Verify Gmail Settings**:
   - Ensure 2-Step Verification is enabled
   - Verify app password is still valid
   - Check if Gmail account has any restrictions

## Testing

After deployment, test the forgot-password flow:
1. Go to forgot password page
2. Enter email address
3. Check Render logs for email sending status
4. Check recipient's inbox (including spam folder)

## Notes

- Render's free tier has network restrictions that may affect SMTP
- Timeouts are handled gracefully - the system will still attempt to send
- If verification times out, email sending is still attempted
- Extended timeouts give Render more time to establish connections

