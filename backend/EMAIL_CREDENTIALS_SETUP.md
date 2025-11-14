# Email Configuration Setup

## Gmail Credentials

The project uses Gmail SMTP for sending verification emails, password reset emails, and admin invitations.

### Current Configuration

- **Email**: `cep.rp.huye@gmail.com`
- **App Password**: `eygpnyeszsbbasoo` (16 characters, no spaces - remove spaces from: eygp nyes zsbb asoo)

## Setup Instructions

### 1. Local Development (.env file)

Create or update `backend/.env` file with:

```env
EMAIL_USER=cep.rp.huye@gmail.com
EMAIL_APP_PASSWORD=eygpnyeszsbbasoo
```

**Important**: The app password should be entered **without spaces**. The code automatically removes any spaces, but it's best to set it correctly.

### 2. Render Deployment (Production)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your `cep-backend` service
3. Navigate to **Environment** tab
4. Add the following environment variables:

   ```
   EMAIL_USER = cep.rp.huye@gmail.com
   EMAIL_APP_PASSWORD = eygpnyeszsbbasoo
   ```

5. Click **Save Changes**
6. Render will automatically redeploy your service

### 3. Verify Email Configuration

After setting up, test the email functionality:

1. **Registration Flow**: Register a new user and check if verification email is sent
2. **Password Reset**: Request a password reset and check if email is received
3. **Admin Invitation**: Create an admin account and verify invitation email

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables**:
   - Verify `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set correctly
   - Ensure app password has no spaces (16 characters: `eygpnyeszsbbasoo`)

2. **Check Gmail Settings**:
   - Ensure 2-Step Verification is enabled on the Gmail account
   - Verify the app password is still valid (regenerate if needed)
   - Check if "Less secure app access" is enabled (not required for app passwords)

3. **Check Server Logs**:
   - Look for email-related errors in Render logs
   - Check for authentication errors (EAUTH)
   - Verify connection errors (ECONNECTION)

### Common Errors

- **EAUTH Error**: Invalid email or app password
  - Solution: Verify credentials and regenerate app password if needed

- **ECONNECTION Error**: Cannot connect to Gmail SMTP
  - Solution: Check internet connection and firewall settings

- **Email configuration missing**: Environment variables not set
  - Solution: Set `EMAIL_USER` and `EMAIL_APP_PASSWORD` in Render Dashboard

## Security Notes

- ✅ App passwords are safer than regular passwords
- ✅ Never commit `.env` file to version control
- ✅ Keep app passwords secure and rotate them periodically
- ✅ The code automatically removes spaces from app passwords for compatibility

## Testing Email Locally

To test email functionality locally:

1. Set up `.env` file with credentials
2. Start the backend server: `npm start`
3. Register a new user or request password reset
4. Check the email inbox for `cep.rp.huye@gmail.com` (if testing with same email) or the recipient's email

## Email Templates

The system sends three types of emails:

1. **Verification Email**: Sent when users register
2. **Password Reset Email**: Sent when users request password reset
3. **Admin Invitation Email**: Sent when super admin creates admin accounts

All emails use professional HTML templates with responsive design.

