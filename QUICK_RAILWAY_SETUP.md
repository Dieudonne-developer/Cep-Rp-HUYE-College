# Quick Railway Database Setup

## 🚀 Fastest Way (Choose One)

### Option 1: PowerShell Script (Recommended)
```powershell
cd backend
.\connect-railway.ps1
```

### Option 2: Batch Script
```cmd
cd backend
connect-railway.bat
```

### Option 3: Manual Commands
```powershell
cd backend
$env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"
node connect-railway-db.js
```

## 📝 After Connection Test Succeeds

### Seed Family Admin Accounts
```powershell
npm run seed:family-admins
```

### Seed Super Admin
```powershell
npm run seed:super-admin
```

### Seed Universal Admin
```powershell
npm run seed:all-admins
```

## ✅ All-in-One Command

To test connection and seed all accounts:
```powershell
cd backend
$env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"
node connect-railway-db.js
npm run seed:family-admins
npm run seed:super-admin
npm run seed:all-admins
```

## 🔍 Verify Connection

The connection test will show:
- ✅ Connection status
- 📊 Database name
- 📁 Collections found
- 👥 User count

## 📚 Full Documentation

See [RAILWAY_DATABASE_SETUP.md](./RAILWAY_DATABASE_SETUP.md) for detailed instructions.

