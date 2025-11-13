# Family Admin Credentials

## All 8 Family Groups - Admin Accounts

### 1. Ishyanga Ryera Choir
- **Email:** `choir@cep.com`
- **Password:** `choir123`
- **Username:** `choiradmin`
- **Group:** `choir`

### 2. Anointed worship team
- **Email:** `anointed@cep.com`
- **Password:** `anointed123`
- **Username:** `anointedadmin`
- **Group:** `anointed`

### 3. Abanyamugisha family
- **Email:** `abanyamugisha@cep.com`
- **Password:** `abanyamugisha123`
- **Username:** `abanyamugishaadmin`
- **Group:** `abanyamugisha`

### 4. Psalm 23 family
- **Email:** `psalm23@cep.com`
- **Password:** `psalm23123`
- **Username:** `psalm23admin`
- **Group:** `psalm23`

### 5. Psalm 46 family
- **Email:** `psalm46@cep.com`
- **Password:** `psalm46123`
- **Username:** `psalm46admin`
- **Group:** `psalm46`

### 6. Protocol family
- **Email:** `protocol@cep.com`
- **Password:** `protocol123`
- **Username:** `protocoladmin`
- **Group:** `protocol`

### 7. Social family
- **Email:** `social@cep.com`
- **Password:** `social123`
- **Username:** `socialadmin`
- **Group:** `social`

### 8. Evangelical family
- **Email:** `evangelical@cep.com`
- **Password:** `evangelical123`
- **Username:** `evangelicaladmin`
- **Group:** `evangelical`

---

## Quick Reference Table

| Family Group | Email | Password | Group Code |
|-------------|-------|----------|------------|
| Ishyanga Ryera Choir | `choir@cep.com` | `choir123` | `choir` |
| Anointed worship team | `anointed@cep.com` | `anointed123` | `anointed` |
| Abanyamugisha family | `abanyamugisha@cep.com` | `abanyamugisha123` | `abanyamugisha` |
| Psalm 23 family | `psalm23@cep.com` | `psalm23123` | `psalm23` |
| Psalm 46 family | `psalm46@cep.com` | `psalm46123` | `psalm46` |
| Protocol family | `protocol@cep.com` | `protocol123` | `protocol` |
| Social family | `social@cep.com` | `social123` | `social` |
| Evangelical family | `evangelical@cep.com` | `evangelical123` | `evangelical` |

---

## How to Login

1. Go to: `http://localhost:3000/admin/login` (or your network IP)
2. Enter the email and password for the family group you want to manage
3. Click "Sign In to Admin Panel"
4. You'll be redirected to `/admin/dashboard` with access to that family's resources

---

## Account Status

✅ All accounts are **verified**  
✅ All accounts are **approved**  
✅ All accounts have **admin role**  
✅ All accounts are ready to use

---

## Re-seeding Accounts

If you need to recreate or update these accounts:

```bash
docker-compose exec backend npm run seed:family-admins
```

This will:
- Create new accounts if they don't exist
- Update existing accounts to ensure they have correct properties
- Reset passwords if needed

---

## All Available Admin Accounts Summary

### Super Admin
- **Email:** `superadmin@cep.com`
- **Password:** `SuperAdmin@2024`
- **Dashboard:** `/admin/super-admins`

### Universal Admin (works for all groups)
- **Email:** `admin@cep.com`
- **Password:** `admin123`
- **Dashboard:** `/admin/dashboard`

### Family-Specific Admins (8 accounts)
- See table above for each family group

---

## Notes

- Each family admin can only manage resources for their specific family group
- Super admin can manage all groups and create new admins
- Universal admin (`admin@cep.com`) works across all groups
- All passwords follow the pattern: `{groupname}123` for easy remembering


