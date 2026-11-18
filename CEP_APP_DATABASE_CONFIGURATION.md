# CEP App Database Configuration - Complete

## ✅ Configuration Status: COMPLETE

The entire project has been configured to use **`cep-app-database`** on Railway MongoDB at `gondola.proxy.rlwy.net:30232`.

## Database Connection Details

- **Database Name**: `cep-app-database`
- **Host**: `gondola.proxy.rlwy.net:30232`
- **Provider**: Railway MongoDB
- **Connection String**: `mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database`

## Files Updated

### Core Backend Files

1. **`backend/utils/mongoUri.js`** ✅
   - Default URI set to Railway MongoDB with `cep-app-database`
   - All scripts using `getMongoUri()` automatically use Railway

2. **`backend/server.js`** ✅
   - Uses `getMongoUri()` from `utils/mongoUri.js`
   - Defaults to Railway MongoDB connection

3. **`backend/env.example`** ✅
   - Updated with Railway MongoDB connection string
   - Includes `cep-app-database` in all examples

### Seed Scripts (All Updated) ✅

All seed scripts now use `getMongoUri()` which defaults to Railway:

- ✅ `seed-family-admins.js`
- ✅ `seed-all-admins.js`
- ✅ `seed-super-admin.js`
- ✅ `seed-admin.js`
- ✅ `seed.js`
- ✅ `seed-choir-admin.js`
- ✅ `seed-anointed-admin.js`
- ✅ `seed-abanyamugisha-admin.js`
- ✅ `seed-psalm23-admin.js`
- ✅ `seed-psalm46-admin.js`
- ✅ `seed-protocol-admin.js`
- ✅ `seed-social-admin.js`
- ✅ `seed-evangelical-admin.js`
- ✅ `migrate-super-admin-to-cepier.js`
- ✅ `backfill-groups.js`
- ✅ `create_sample_data.js`

### Helper Scripts ✅

- ✅ `backend/connect-railway-db.js` - Connection test script
- ✅ `backend/connect-railway.ps1` - PowerShell helper
- ✅ `backend/connect-railway.bat` - Batch helper
- ✅ `backend/setup-railway-database.js` - Master setup script

### Configuration Files ✅

- ✅ `docker-compose.yml` - Updated for Railway (optional local override)
- ✅ `render.yaml` - Updated with Railway connection string
- ✅ `backend/DATABASE_CONFIG.md` - Updated documentation

### Documentation Files ✅

- ✅ `RAILWAY_DATABASE_SETUP.md` - Complete setup guide
- ✅ `QUICK_RAILWAY_SETUP.md` - Quick reference
- ✅ `DEPLOYMENT_GUIDE.md` - Deployment instructions
- ✅ `RENDER_DEPLOYMENT.md` - Render-specific guide
- ✅ `README_DEPLOYMENT.md` - Quick deployment checklist
- ✅ `DEPLOYMENT_CHANGES_SUMMARY.md` - Summary of changes
- ✅ `backend/REGISTRATION_SETUP.md` - Registration setup guide

## How It Works

### Default Behavior

1. **All scripts check `process.env.MONGODB_URI` first**
2. **If not set, they use `getMongoUri()` from `utils/mongoUri.js`**
3. **`getMongoUri()` defaults to Railway MongoDB with `cep-app-database`**

### Connection Priority

```
1. MONGODB_URI environment variable (highest priority)
2. getMongoUri() default → Railway MongoDB (cep-app-database)
```

## Usage Examples

### Test Connection

```powershell
cd backend
.\connect-railway.ps1
```

Or manually:
```powershell
cd backend
$env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"
node connect-railway-db.js
```

### Seed Database

```powershell
cd backend
# Connection is automatic via getMongoUri()
npm run seed:family-admins
npm run seed:super-admin
npm run seed:all-admins
```

### Sync existing local data to Railway

If your local `cep_database` already contains songs, events, chat messages, etc., copy everything to Railway with one command:

```powershell
cd backend
# Optional overrides (defaults shown)
$env:MONGODB_URI_SOURCE = "mongodb://localhost:27017/cep_database"
$env:MONGODB_URI_TARGET = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"
npm run sync:db
```

This copies every collection (songs, events, messages, assets, etc.) from your local database to `cep-app-database` on Railway.

### Run Backend Server

```powershell
cd backend
# Server automatically uses Railway MongoDB via getMongoUri()
npm start
```

## Environment Variables

### For Production (Render)

Set in Render Dashboard:
```
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
```

### For Local Development

Create `backend/.env`:
```env
MONGODB_URI=mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database
```

Or use local MongoDB (optional):
```env
MONGODB_URI=mongodb://localhost:27017/cep-app-database
```

## Verification

### 1. Check Connection

```powershell
cd backend
node connect-railway-db.js
```

Expected output:
```
✅ Successfully connected to MongoDB!
📊 Database: cep-app-database
🌐 Host: gondola.proxy.rlwy.net
🔌 Port: 30232
```

### 2. Verify Backend Server

```powershell
cd backend
npm start
```

Check logs for:
```
✅ Connected to MongoDB successfully!
📊 Database: cep-app-database
```

### 3. Test Seed Scripts

```powershell
cd backend
npm run seed:family-admins
```

Should connect to Railway and create admin accounts.

## Database Collections

All collections are stored in `cep-app-database`:

- `userregistrations` - Choir users
- `anointedusers` - Anointed users
- `abanyamugishausers` - Abanyamugisha users
- `psalm23users` - Psalm 23 users
- `psalm46users` - Psalm 46 users
- `protocolusers` - Protocol users
- `socialusers` - Social users
- `evangelicalusers` - Evangelical users
- `cepierusers` - CEPier users
- `songs` - All songs
- `events` - All events
- `chatmessages` - Chat messages
- `assets` - File assets
- And more...

## Important Notes

1. **All scripts default to Railway** - No need to set `MONGODB_URI` unless you want to override
2. **Database name is `cep-app-database`** - Not `cep_database`
3. **Connection is persistent** - Railway MongoDB is always available
4. **Backward compatible** - Can still use local MongoDB by setting `MONGODB_URI`

## Troubleshooting

### Connection Fails

1. Verify Railway MongoDB service is running
2. Check connection string is correct (no typos)
3. Ensure network allows connections to `gondola.proxy.rlwy.net:30232`

### Wrong Database

If scripts connect to wrong database:
1. Check `MONGODB_URI` environment variable
2. Verify `backend/utils/mongoUri.js` has correct default
3. Ensure connection string includes `/cep-app-database` at the end

### Seed Scripts Fail

1. Run connection test first: `node connect-railway-db.js`
2. Verify database is accessible
3. Check seed script uses `getMongoUri()` or sets `MONGODB_URI`

## Summary

✅ **All files updated to use `cep-app-database` on Railway**
✅ **All seed scripts use Railway by default**
✅ **Backend server uses Railway by default**
✅ **Documentation updated**
✅ **Helper scripts configured**
✅ **Deployment configuration updated**

The project is now fully configured to use Railway MongoDB with the `cep-app-database` database.

