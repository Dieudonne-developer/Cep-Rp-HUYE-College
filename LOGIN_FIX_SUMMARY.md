# Login 401 Error - Fixed ✅

## Problem
Getting `401 Unauthorized` error when trying to log in with `admin@ishyangaryera.com`.

## Root Cause
The admin account `admin@ishyangaryera.com` did not exist in the database.

## Solution Applied

### 1. Created Admin Accounts
Ran the seed script to create admin accounts for all groups:
```bash
docker-compose exec backend npm run seed:all-admins
```

**Admin Credentials Created:**
- **Email:** `admin@cep.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Status:** Verified ✅ | Approved ✅

### 2. Updated Login Page
Updated `frontend/src/pages/TestLoginPage.tsx` to use the correct credentials:
- Changed default email from `admin@ishyangaryera.com` to `admin@cep.com`
- Updated placeholder text
- Updated test credentials display

## How to Login Now

1. Go to: `http://localhost:3000/admin/login`
2. Use these credentials:
   - **Email:** `admin@cep.com`
   - **Password:** `admin123`
3. Click "Sign In to Admin Panel"

## Admin Accounts Available

The seed script created admin accounts in all groups:
- ✅ Choir
- ✅ Anointed
- ✅ Abanyamugisha
- ✅ Psalm23
- ✅ Psalm46
- ✅ Protocol
- ✅ Social
- ✅ Evangelical
- ✅ CEPier

All use the same credentials: `admin@cep.com` / `admin123`

## Verification

To verify admin accounts exist:
```bash
docker-compose exec backend node -e "const mongoose = require('mongoose'); const UserRegistration = require('./models/UserRegistration'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const user = await UserRegistration.findOne({ email: 'admin@cep.com' }); console.log('Admin found:', user ? 'YES' : 'NO'); if (user) { console.log('Email:', user.email); console.log('Role:', user.role); console.log('Verified:', user.isVerified); console.log('Approved:', user.isApproved); } mongoose.connection.close(); });"
```

## Next Steps

After logging in successfully, you can:
1. Access the admin dashboard
2. Create additional admin accounts
3. Manage users, events, songs, etc.

## Troubleshooting

If you still get 401 errors:
1. Make sure MongoDB is connected: `docker-compose logs backend | grep MongoDB`
2. Verify admin exists: Run the verification command above
3. Check backend logs: `docker-compose logs backend | grep "ADMIN LOGIN"`
4. Re-seed if needed: `docker-compose exec backend npm run seed:all-admins`


