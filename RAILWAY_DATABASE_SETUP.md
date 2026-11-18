# Railway Database Setup Commands

This guide provides commands to connect your project to Railway MongoDB.

## Railway MongoDB Connection String

```
mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
```

## Quick Commands

### Option 1: Set Environment Variable and Run Scripts (Recommended)

**Windows PowerShell:**
```powershell
# Navigate to backend directory
cd backend

# Set MONGODB_URI for current session
$env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"

# Test connection
node connect-railway-db.js

# Seed family admin accounts
npm run seed:family-admins

# Seed super admin
npm run seed:super-admin

# Seed all admins (universal admin)
npm run seed:all-admins
```

**Windows Command Prompt (CMD):**
```cmd
cd backend
set MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
node connect-railway-db.js
npm run seed:family-admins
npm run seed:super-admin
npm run seed:all-admins
```

### Option 2: Create .env File (Permanent)

**Windows PowerShell:**
```powershell
cd backend
@"
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
"@ | Out-File -FilePath .env -Encoding utf8

# Then run scripts normally
node connect-railway-db.js
npm run seed:family-admins
```

**Windows Command Prompt:**
```cmd
cd backend
echo MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database > .env
node connect-railway-db.js
npm run seed:family-admins
```

### Option 3: One-Line Commands

**Test Connection:**
```powershell
cd backend; $env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"; node connect-railway-db.js
```

**Seed Family Admins:**
```powershell
cd backend; $env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"; npm run seed:family-admins
```

**Seed All Admins:**
```powershell
cd backend; $env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"; npm run seed:all-admins; npm run seed:super-admin
```

## Step-by-Step Setup

### 1. Test Database Connection

```powershell
cd backend
$env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"
node connect-railway-db.js
```

**Expected Output:**
```
🔌 Connecting to MongoDB...
📍 Host: Railway MongoDB
✅ Successfully connected to MongoDB!
📊 Database: [database name]
```

### 2. Seed Family Admin Accounts

```powershell
npm run seed:family-admins
```

This creates admin accounts for:
- Ishyanga Ryera Choir
- Anointed worship team
- Abanyamugisha family
- Psalm 23 family
- Psalm 46 family
- Protocol family
- Social family
- Evangelical family

### 3. Seed Super Admin

```powershell
npm run seed:super-admin
```

Creates super admin account: `superadmin@cep.com` / `SuperAdmin@2024`

### 4. Seed Universal Admin

```powershell
npm run seed:all-admins
```

Creates universal admin account: `admin@cep.com` / `admin123` (works for all groups)

### 5. Copy existing local data (songs, messages, etc.)

If your local `cep_database` already contains production data, sync everything to Railway:

```powershell
cd backend
$env:MONGODB_URI_SOURCE = "mongodb://localhost:27017/cep_database"
$env:MONGODB_URI_TARGET = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"
npm run sync:db
```

This copies every collection (songs, events, chatmessages, assets, etc.) so `cep-app-database` on Railway mirrors your local database.

## Available Seed Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Family Admins | `npm run seed:family-admins` | Creates unique admin for each family group |
| Super Admin | `npm run seed:super-admin` | Creates super admin account |
| All Admins | `npm run seed:all-admins` | Creates universal admin for all groups |
| Individual Groups | `npm run seed:choir-admin` | Creates admin for specific group |
| | `npm run seed:anointed-admin` | |
| | `npm run seed:psalm23-admin` | |
| | etc. | |

## Verify Database Connection

After setting up, verify the connection:

```powershell
cd backend
$env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"
node connect-railway-db.js
```

## Troubleshooting

### Connection Refused
- Verify Railway MongoDB service is running
- Check connection string is correct (no typos)
- Ensure Railway allows external connections

### Authentication Failed
- Verify username and password in connection string
- Check Railway MongoDB credentials

### Timeout
- Check network connectivity
- Verify Railway service is accessible
- Try increasing timeout in connection options

## For Production (Render)

Set the environment variable in Render Dashboard:
```
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
```

The backend will automatically use this when deployed on Render.

