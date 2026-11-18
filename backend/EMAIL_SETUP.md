# Email Setup Guide

This document explains how to configure email functionality for user verification in the CEP application.

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "CEP Application" as the name
5. Copy the generated 16-character password

### Step 3: Configure Environment Variables
Add the following to your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

## Alternative Email Providers

### Outlook/Hotmail
1. Enable 2-Factor Authentication
2. Generate app password
3. Use your email and app password in `.env`

### Custom SMTP Server
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_SECURE=false
```

## Testing Email Configuration

Use the test endpoint to verify your email setup:
```bash
curl http://localhost:4000/api/test-email
```

## Troubleshooting

### Common Issues:
1. **Authentication failed**: Check if 2FA is enabled and app password is correct
2. **Connection timeout**: Verify SMTP settings and firewall rules
3. **Invalid credentials**: Double-check email and password

### Security Notes:
- Never commit `.env` file to version control
- Use app passwords instead of your main account password
- Regularly rotate app passwords



