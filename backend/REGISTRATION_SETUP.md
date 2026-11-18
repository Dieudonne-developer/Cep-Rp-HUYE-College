# Registration System Setup

## Environment Variables Required

Add these variables to your `.env` file in the backend directory:

```env
# MongoDB Connection (Railway - Production)
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database

# For Local Development (optional):
# MONGODB_URI=mongodb://localhost:27017/cep-app-database

# Email Configuration (Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://10.11.217.18:5173,http://172.16.12.113:5173
```

## Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Ishyanga Ryera Choir" as the name
   - Copy the generated 16-character password
3. **Set Environment Variables**:
   - `EMAIL_USER`: Your Gmail address (e.g., `yourname@gmail.com`)
   - `EMAIL_APP_PASSWORD`: The 16-character app password (not your regular Gmail password)

## Features Implemented

### Frontend
- ✅ Registration page at `/choir/register`
- ✅ Gmail validation (only Gmail accounts accepted)
- ✅ Username validation (minimum 3 characters)
- ✅ Profile image upload (optional)
- ✅ Form validation and error handling
- ✅ Success/error notifications

### Backend
- ✅ User registration endpoint (`/api/auth/register`)
- ✅ Email verification endpoint (`/api/auth/verify`)
- ✅ Password setup endpoint (`/api/auth/set-password`)
- ✅ Nodemailer integration for Gmail
- ✅ Bcrypt password hashing
- ✅ MongoDB schema for user registration
- ✅ Profile image upload handling

### Email Flow
1. User registers with Gmail, username, and optional profile image
2. System sends verification email to Gmail
3. User clicks link in email to set password
4. User completes registration and can login to chat

## Testing the Registration

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test registration**:
   - Go to `http://10.11.217.18:5173/choir`
   - Click "Register" link
   - Fill out the registration form
   - Check your Gmail for verification email
   - Click the verification link
   - Set your password
   - Return to choir page and login

## Security Features

- ✅ Gmail-only registration
- ✅ Email verification required
- ✅ Password hashing with bcrypt
- ✅ Token-based verification
- ✅ Input validation and sanitization
- ✅ File upload restrictions
