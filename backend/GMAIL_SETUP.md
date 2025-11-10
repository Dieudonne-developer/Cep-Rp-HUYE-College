# Gmail App Password Setup Guide

## How to Generate Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the prompts to enable 2-factor authentication

### Step 2: Generate App Password
1. Go back to "Security" settings
2. Under "Signing in to Google", click "App passwords"
3. Select "Mail" as the app
4. Select "Other (Custom name)" as the device
5. Enter "CEP Choir System" as the name
6. Click "Generate"
7. Copy the 16-character password (it will look like: abcd efgh ijkl mnop)

### Step 3: Update .env File
Replace `your-app-password-here` in your `.env` file with the generated app password:

```env
EMAIL_USER=elyseemusabyimana5@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Test Email Functionality
After updating the .env file, restart your server and test the registration.

## Important Notes:
- App passwords are 16 characters with spaces (remove spaces when using)
- Each app password can only be used for one application
- You can generate multiple app passwords for different applications
- If you change your Google password, app passwords remain valid
- App passwords are more secure than using your regular Gmail password

## Troubleshooting:
- If emails are not sending, check that 2FA is enabled
- Verify the app password is correct (no extra spaces)
- Check that the Gmail account has "Less secure app access" disabled (it should be)
- Make sure the EMAIL_USER matches the Gmail account where you generated the app password



