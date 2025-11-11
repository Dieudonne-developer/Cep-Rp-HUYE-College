# How to Create Admin Accounts on Render

## Problem
The 500 error on admin login is likely because:
1. **MongoDB is not connected** (most likely)
2. **Admin accounts don't exist** in the database

## Solution: Create Admin Accounts

I've created a script `backend/seed-all-admins.js` that creates admin accounts for all groups.

### Admin Credentials (works for all groups):
- **Email:** `admin@cep.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Status:** Verified and Approved

## Method 1: Run Seed Script on Render (Recommended)

### Step 1: Check MongoDB Connection

1. Go to **Render Dashboard** → `cep-backend` → **Environment**
2. Verify `MONGODB_URI` is set correctly
3. Check **Logs** for: `✅ Connected to MongoDB`

### Step 2: Run Seed Script via Render Shell

1. Go to **Render Dashboard** → `cep-backend` → **Shell** (or use SSH)
2. Run:
   ```bash
   cd /opt/render/project/src/backend
   npm run seed:all-admins
   ```

### Step 3: Verify Admin Accounts

The script will create admin accounts in all groups:
- ✅ Choir
- ✅ Anointed
- ✅ Abanyamugisha
- ✅ Psalm 23
- ✅ Psalm 46
- ✅ Protocol
- ✅ Social
- ✅ Evangelical
- ✅ CEPier (if model exists)

## Method 2: Run Seed Script Locally (if MongoDB is accessible)

If your MongoDB is accessible from your local machine:

```bash
cd backend
npm run seed:all-admins
```

Make sure `.env` file has correct `MONGODB_URI`.

## Method 3: Create Admin via API (if backend is running)

You can also create an admin account by registering through the frontend, then manually updating the database to set:
- `isVerified: true`
- `isApproved: true`
- `role: 'admin'`

## Method 4: Manual Database Update

If you have MongoDB access:

1. Connect to your MongoDB database
2. For each collection (choirusers, anointedusers, etc.), insert:
   ```javascript
   {
     email: "admin@cep.com",
     username: "admin",
     password: "$2a$10$...", // bcrypt hash of "admin123"
     isVerified: true,
     isApproved: true,
     role: "admin",
     adminGroup: "choir", // or appropriate group
     approvedBy: "system",
     approvedAt: new Date()
   }
   ```

To generate password hash:
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('admin123', 10);
console.log(hash);
```

## Login After Creating Admin

1. Go to: `https://cep-frontend-vy68.onrender.com/admin/login`
2. Enter:
   - **Email:** `admin@cep.com`
   - **Password:** `admin123`
3. Click **Login**

## Troubleshooting

### Still Getting 500 Error?

1. **Check MongoDB Connection:**
   - Render Dashboard → `cep-backend` → Logs
   - Look for: `✅ Connected to MongoDB` or `❌ MongoDB connection error`

2. **Check Backend Logs:**
   - Look for specific error messages
   - Check if admin accounts were created successfully

3. **Verify MONGODB_URI:**
   - Render Dashboard → `cep-backend` → Environment
   - Ensure `MONGODB_URI` is set correctly

4. **Test Backend Health:**
   ```bash
   curl https://cep-backend-hjfu.onrender.com/api/home
   ```
   Should return: `{"message":"CEP Backend Server is running!"}`

### Admin Account Not Found?

- Run the seed script again (it's safe to run multiple times)
- Check if the email is correct: `admin@cep.com`
- Verify the account exists in the correct collection

## Security Note

⚠️ **Important:** Change the default password (`admin123`) after first login in production!

The seed script creates accounts with:
- ✅ `isVerified: true` (email verified)
- ✅ `isApproved: true` (admin approved)
- ✅ `role: 'admin'` (admin access)

All accounts are ready to use immediately after creation.

