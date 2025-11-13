# MongoDB Connection Configuration

This guide covers MongoDB connection setup for:
- **Docker Desktop** (Local MongoDB)
- **Render Deployment** (Cloud MongoDB - MongoDB Atlas)

## For Docker Desktop (Local MongoDB)

### ✅ Already Configured!

The project is already set up to use **local MongoDB** in Docker Desktop:

1. **Docker Compose** (`docker-compose.yml`) includes a MongoDB service:
   ```yaml
   mongo:
     image: mongo:6.0
     ports:
       - "27017:27017"
   ```

2. **Backend** is configured to connect to MongoDB service:
   ```yaml
   MONGODB_URI: mongodb://mongo:27017/cep_database
   ```

### Starting MongoDB with Docker

Simply run:
```bash
docker-compose up -d
```

This will start:
- MongoDB on port `27017`
- Backend on port `4000`
- Frontend on port `3000`

### Verifying Local MongoDB Connection

1. Check Docker containers:
   ```bash
   docker-compose ps
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend | grep MongoDB
   ```
   Should show: `✅ Connected to MongoDB`

3. Test API:
   ```bash
   curl http://localhost:4000/api/home
   ```

### For Local Development (Without Docker)

If running backend locally (not in Docker), use:
```env
MONGODB_URI=mongodb://localhost:27017/cep_database
```

Make sure MongoDB is running locally on port 27017.

---

## For Render Deployment (Cloud MongoDB)

### Error
```
❌ MongoDB connection error: MongooseServerSelectionError: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

### Problem
The backend is trying to connect to `localhost:27017` (default MongoDB URI), which means `MONGODB_URI` environment variable is **not set** in Render.

### Solution: Set MONGODB_URI in Render

### Step 1: Get Your MongoDB Connection String

You need a MongoDB connection string. Options:

#### Option A: MongoDB Atlas (Cloud - Recommended for Render)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you don't have one)
3. Go to **Database Access** → Create a database user
4. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all IPs)
5. Go to **Database** → Click **Connect** → **Connect your application**
6. Copy the connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password
8. Replace `<database>` with your database name (e.g., `cep_database`)

#### Option B: Use Existing Cloud MongoDB
If you already have a cloud MongoDB connection string, use that.

### Step 2: Set MONGODB_URI in Render

1. Go to **Render Dashboard** → `cep-backend` service
2. Click on **Environment** tab
3. Click **Add Environment Variable**
4. Add:
   - **Key:** `MONGODB_URI`
   - **Value:** Your MongoDB Atlas connection string (from Step 1)
   - **Example:** `mongodb+srv://username:password@cluster.mongodb.net/cep_database?retryWrites=true&w=majority`
5. Click **Save Changes**

**Important:** 
- ❌ **Do NOT use** `mongodb://localhost:27017/cep_database` on Render (localhost doesn't exist on cloud servers)
- ✅ **Use MongoDB Atlas** or another cloud MongoDB service for Render deployment
- ✅ **For Docker Desktop**, use `mongodb://mongo:27017/cep_database` (already configured)

### Step 3: Redeploy Backend

After setting the environment variable:

1. Go to **Render Dashboard** → `cep-backend` service
2. Click **Manual Deploy** → **Deploy latest commit**
   - OR wait for automatic redeploy (Render auto-redeploys when env vars change)

### Step 4: Verify Connection

1. Go to **Render Dashboard** → `cep-backend` → **Logs**
2. Look for:
   ```
   ✅ Connected to MongoDB
   ```
3. If you still see errors, check:
   - MongoDB connection string is correct
   - Password is correct (no special characters need URL encoding)
   - Network access allows Render's IPs (use `0.0.0.0/0` for testing)
   - Database name is correct

## Common Issues

### Issue 1: Password Contains Special Characters

If your MongoDB password has special characters (like `@`, `#`, `%`), you need to URL-encode them:

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

Example:
- Password: `P@ssw0rd#123`
- Encoded: `P%40ssw0rd%23123`
- Connection string: `mongodb+srv://username:P%40ssw0rd%23123@cluster.mongodb.net/cep_database`

### Issue 2: Network Access Not Allowed

MongoDB Atlas blocks connections by default. You must:

1. Go to MongoDB Atlas → **Network Access**
2. Click **Add IP Address**
3. Add `0.0.0.0/0` (allow all IPs) for testing
   - ⚠️ **Security Note:** For production, restrict to Render's IPs
4. Click **Confirm**

### Issue 3: Database User Not Created

1. Go to MongoDB Atlas → **Database Access**
2. Click **Add New Database User**
3. Set username and password
4. Set privileges: **Read and write to any database**
5. Click **Add User**

### Issue 4: Connection String Format

Make sure your connection string is in this format:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

NOT:
- ❌ `mongodb://localhost:27017/cep_database` (local only)
- ❌ `mongodb+srv://username:password@cluster.mongodb.net` (missing database name)

## Test Connection

After setting `MONGODB_URI`, test the connection:

1. Check backend logs for: `✅ Connected to MongoDB`
2. Test API endpoint:
   ```bash
   curl https://cep-backend-hjfu.onrender.com/api/home
   ```
   Should return: `{"message":"CEP Backend Server is running!"}`

## After MongoDB is Connected

Once MongoDB is connected, you can:

1. **Create admin accounts:**
   ```bash
   npm run seed:all-admins
   ```
   (Run this via Render Shell or add to build command temporarily)

2. **Login:**
   - Go to: `https://cep-frontend-vy68.onrender.com/admin/login`
   - Email: `admin@cep.com`
   - Password: `admin123`

## Summary

### Docker Desktop (Local)
✅ **MongoDB is already configured in `docker-compose.yml`**
✅ **Connection string:** `mongodb://mongo:27017/cep_database`
✅ **Start with:** `docker-compose up -d`
✅ **No additional configuration needed!**

### Render Deployment (Cloud)
✅ **Set `MONGODB_URI` in Render Environment Variables**
✅ **Use MongoDB Atlas connection string (not localhost)**
✅ **Redeploy backend after setting environment variable**
✅ **Verify connection in logs: `✅ Connected to MongoDB`**

The error `ECONNREFUSED 127.0.0.1:27017` means the backend is trying to connect to localhost, which doesn't exist on Render. You **must** set `MONGODB_URI` to a cloud MongoDB connection string (MongoDB Atlas recommended).




