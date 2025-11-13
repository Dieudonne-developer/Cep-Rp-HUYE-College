# Admin Credentials Guide

## Super Admin Account

**For Super Admin Dashboard Access:**

- **Email:** `superadmin@cep.com`
- **Password:** `SuperAdmin@2024`
- **Role:** `super-admin`
- **Group:** `cepier` (CEPier Family)
- **Access:** Full access to all groups and super admin dashboard

### Super Admin Features:
- ✅ Create admin accounts for any group
- ✅ View all admins across all groups
- ✅ Suspend/Approve admin accounts
- ✅ Delete admin accounts
- ✅ Full access to "Manage Admins" page
- ✅ Manage CEPier members approval
- ✅ Access to Super Admin Dashboard (`/admin/super-admins`)

### Login URL:
- Local: `http://localhost:3000/admin/login`
- Network: `http://YOUR_IP:3000/admin/login`

---

## Regular Admin Account

**For Regular Admin Dashboard Access:**

- **Email:** `admin@cep.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Group:** Works for all groups (Choir, Anointed, Abanyamugisha, Psalm23, Psalm46, Protocol, Social, Evangelical, CEPier)
- **Access:** Regular admin dashboard (`/admin/dashboard`)

### Regular Admin Features:
- ✅ Manage events, songs, members for their group
- ✅ View and manage ideas
- ✅ Support management
- ✅ Access to Admin Dashboard

---

## Account Types Summary

| Account Type | Email | Password | Role | Dashboard |
|-------------|-------|----------|------|-----------|
| **Super Admin** | `superadmin@cep.com` | `SuperAdmin@2024` | `super-admin` | `/admin/super-admins` |
| **Regular Admin** | `admin@cep.com` | `admin123` | `admin` | `/admin/dashboard` |

---

## How to Use

### 1. Super Admin Login
1. Go to: `http://localhost:3000/admin/login`
2. Enter:
   - Email: `superadmin@cep.com`
   - Password: `SuperAdmin@2024`
3. Click "Sign In to Admin Panel"
4. You'll be redirected to `/admin/super-admins` (Super Admin Dashboard)

### 2. Regular Admin Login
1. Go to: `http://localhost:3000/admin/login`
2. Enter:
   - Email: `admin@cep.com`
   - Password: `admin123`
3. Click "Sign In to Admin Panel"
4. You'll be redirected to `/admin/dashboard` (Regular Admin Dashboard)

---

## Creating More Admin Accounts

### Using Super Admin Dashboard:
1. Login as super admin
2. Go to Super Admin Dashboard
3. Click "Create New Admin"
4. Fill in the details:
   - Email
   - Username
   - Admin Group (choir, anointed, etc.)
   - Role (admin, editor, viewer)
5. The new admin will receive an email to set their password

### Using Seed Scripts:
```bash
# Create super admin
docker-compose exec backend npm run seed:super-admin

# Create admin for all groups
docker-compose exec backend npm run seed:all-admins

# Create admin for specific group
docker-compose exec backend npm run seed:admin
docker-compose exec backend npm run seed:anointed-admin
# etc.
```

---

## Verification

To verify accounts exist in the database:

```bash
# Check super admin
docker-compose exec backend node -e "const mongoose = require('mongoose'); const CepierUser = require('./models/CepierUser'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const user = await CepierUser.findOne({ email: 'superadmin@cep.com' }); console.log('Super Admin:', user ? 'EXISTS' : 'NOT FOUND'); if (user) console.log('Role:', user.role, '| Verified:', user.isVerified, '| Approved:', user.isApproved); mongoose.connection.close(); });"

# Check regular admin
docker-compose exec backend node -e "const mongoose = require('mongoose'); const UserRegistration = require('./models/UserRegistration'); mongoose.connect(process.env.MONGODB_URI).then(async () => { const user = await UserRegistration.findOne({ email: 'admin@cep.com' }); console.log('Admin:', user ? 'EXISTS' : 'NOT FOUND'); if (user) console.log('Role:', user.role, '| Verified:', user.isVerified, '| Approved:', user.isApproved); mongoose.connection.close(); });"
```

---

## Important Notes

1. **Super Admin must be CEPier member:** Super admins must belong to the CEPier family group
2. **Password Security:** Change passwords after first login in production
3. **Account Status:** Both accounts are verified and approved by default
4. **Network Access:** Use your network IP instead of localhost when accessing from other devices

---

## Troubleshooting

### Can't Login?
1. Check if account exists (use verification commands above)
2. Check backend logs: `docker-compose logs backend | grep "ADMIN LOGIN"`
3. Verify MongoDB is connected: `docker-compose logs backend | grep MongoDB`
4. Check if account is verified and approved

### Wrong Dashboard?
- Super admin → `/admin/super-admins`
- Regular admin → `/admin/dashboard`
- The login automatically redirects based on role

### Need to Reset Password?
- Super admin: Run `npm run seed:super-admin` (will update if exists)
- Regular admin: Run `npm run seed:all-admins` (will update if exists)


