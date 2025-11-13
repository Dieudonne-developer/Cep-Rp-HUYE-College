# Complete Admin Credentials Guide

## All Available Admin Accounts

### 🔴 Super Admin (Full Access)
- **Email:** `superadmin@cep.com`
- **Password:** `SuperAdmin@2024`
- **Role:** `super-admin`
- **Group:** `cepier`
- **Dashboard:** `/admin/super-admins`
- **Access:** Full access to all groups, can create/manage all admins

---

### 🟢 Universal Admin (All Groups)
- **Email:** `admin@cep.com`
- **Password:** `admin123`
- **Role:** `admin`
- **Group:** Works for all groups
- **Dashboard:** `/admin/dashboard`
- **Access:** Regular admin access across all family groups

---

### 🟡 Family-Specific Admins (8 Accounts)

#### 1. Ishyanga Ryera Choir
- **Email:** `choir@cep.com`
- **Password:** `choir123`
- **Username:** `choiradmin`
- **Group:** `choir`
- **Dashboard:** `/admin/dashboard`
- **Access:** Manage Choir events, songs, members, ideas

#### 2. Anointed worship team
- **Email:** `anointed@cep.com`
- **Password:** `anointed123`
- **Username:** `anointedadmin`
- **Group:** `anointed`
- **Dashboard:** `/admin/dashboard`
- **Access:** Manage Anointed events, songs, members, ideas

#### 3. Abanyamugisha family
- **Email:** `abanyamugisha@cep.com`
- **Password:** `abanyamugisha123`
- **Username:** `abanyamugishaadmin`
- **Group:** `abanyamugisha`
- **Dashboard:** `/admin/dashboard`
- **Access:** Manage Abanyamugisha events, songs, members, ideas

#### 4. Psalm 23 family
- **Email:** `psalm23@cep.com`
- **Password:** `psalm23123`
- **Username:** `psalm23admin`
- **Group:** `psalm23`
- **Dashboard:** `/admin/dashboard`
- **Access:** Manage Psalm 23 events, songs, members, ideas

#### 5. Psalm 46 family
- **Email:** `psalm46@cep.com`
- **Password:** `psalm46123`
- **Username:** `psalm46admin`
- **Group:** `psalm46`
- **Dashboard:** `/admin/dashboard`
- **Access:** Manage Psalm 46 events, songs, members, ideas

#### 6. Protocol family
- **Email:** `protocol@cep.com`
- **Password:** `protocol123`
- **Username:** `protocoladmin`
- **Group:** `protocol`
- **Dashboard:** `/admin/dashboard`
- **Access:** Manage Protocol events, songs, members, ideas

#### 7. Social family
- **Email:** `social@cep.com`
- **Password:** `social123`
- **Username:** `socialadmin`
- **Group:** `social`
- **Dashboard:** `/admin/dashboard`
- **Access:** Manage Social events, songs, members, ideas

#### 8. Evangelical family
- **Email:** `evangelical@cep.com`
- **Password:** `evangelical123`
- **Username:** `evangelicaladmin`
- **Group:** `evangelical`
- **Dashboard:** `/admin/dashboard`
- **Access:** Manage Evangelical events, songs, members, ideas

---

## Quick Reference Table

| Account Type | Email | Password | Dashboard |
|-------------|-------|----------|-----------|
| **Super Admin** | `superadmin@cep.com` | `SuperAdmin@2024` | `/admin/super-admins` |
| **Universal Admin** | `admin@cep.com` | `admin123` | `/admin/dashboard` |
| **Choir Admin** | `choir@cep.com` | `choir123` | `/admin/dashboard` |
| **Anointed Admin** | `anointed@cep.com` | `anointed123` | `/admin/dashboard` |
| **Abanyamugisha Admin** | `abanyamugisha@cep.com` | `abanyamugisha123` | `/admin/dashboard` |
| **Psalm 23 Admin** | `psalm23@cep.com` | `psalm23123` | `/admin/dashboard` |
| **Psalm 46 Admin** | `psalm46@cep.com` | `psalm46123` | `/admin/dashboard` |
| **Protocol Admin** | `protocol@cep.com` | `protocol123` | `/admin/dashboard` |
| **Social Admin** | `social@cep.com` | `social123` | `/admin/dashboard` |
| **Evangelical Admin** | `evangelical@cep.com` | `evangelical123` | `/admin/dashboard` |

---

## How to Use

### Login Steps:
1. Go to: `http://localhost:3000/admin/login` (or your network IP)
2. Enter email and password from the table above
3. Click "Sign In to Admin Panel"
4. You'll be redirected to the appropriate dashboard

### Account Status:
✅ All accounts are **verified**  
✅ All accounts are **approved**  
✅ All accounts have **admin role**  
✅ All accounts are **ready to use**

---

## Re-seeding Accounts

### Create/Update All Family Admins:
```bash
docker-compose exec backend npm run seed:family-admins
```

### Create/Update Universal Admin (all groups):
```bash
docker-compose exec backend npm run seed:all-admins
```

### Create/Update Super Admin:
```bash
docker-compose exec backend npm run seed:super-admin
```

---

## Password Pattern

- **Super Admin:** `SuperAdmin@2024`
- **Universal Admin:** `admin123`
- **Family Admins:** `{groupname}123`
  - Example: `choir123`, `anointed123`, etc.

---

## Access Levels

### Super Admin (`superadmin@cep.com`)
- ✅ Create admin accounts for any group
- ✅ View all admins across all groups
- ✅ Suspend/Approve admin accounts
- ✅ Delete admin accounts
- ✅ Full access to Super Admin Dashboard
- ✅ Manage CEPier members approval

### Universal Admin (`admin@cep.com`)
- ✅ Manage events, songs, members for all groups
- ✅ View and manage ideas for all groups
- ✅ Support management
- ✅ Access to Admin Dashboard

### Family-Specific Admins
- ✅ Manage events, songs, members for their specific family
- ✅ View and manage ideas for their family
- ✅ Support management for their family
- ✅ Access to Admin Dashboard (filtered to their family)

---

## Login Page

The login page at `/admin/login` now displays all these credentials in a scrollable list, making it easy to:
- See all available accounts
- Copy credentials
- Click "Fill Test Credentials" to auto-fill

---

## Network Access

From other devices on your network:
- **Frontend:** `http://YOUR_IP:3000/admin/login`
- Use any of the credentials above to login

---

## Summary

✅ **10 admin accounts created** (1 super admin + 1 universal + 8 family-specific)  
✅ **All accounts verified and approved**  
✅ **Login page updated with all credentials**  
✅ **Ready to use immediately**

All accounts are ready for testing and development!


