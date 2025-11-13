# MongoDB Setup Guide

## Quick Start

### Docker Desktop (Recommended)
```bash
docker-compose up -d
```

That's it! MongoDB is automatically configured and running.

## Configuration Details

### Docker Desktop Configuration

**File:** `docker-compose.yml`

```yaml
mongo:
  image: mongo:6.0
  ports:
    - "27017:27017"
  volumes:
    - mongo-data:/data/db

backend:
  environment:
    MONGODB_URI: mongodb://mongo:27017/cep_database
```

**Connection String:** `mongodb://mongo:27017/cep_database`
- `mongo` = service name in Docker network
- `27017` = MongoDB port
- `cep_database` = database name

### Local Development (Without Docker)

**File:** `backend/.env` or `backend/env.example`

```env
MONGODB_URI=mongodb://localhost:27017/cep_database
```

**Requirements:**
- MongoDB must be installed and running locally
- Default port: `27017`
- Database name: `cep_database`

### Render Deployment (Cloud)

**File:** `render.yaml`

Set `MONGODB_URI` in Render Dashboard:
- **Key:** `MONGODB_URI`
- **Value:** MongoDB Atlas connection string
- **Example:** `mongodb+srv://username:password@cluster.mongodb.net/cep_database?retryWrites=true&w=majority`

## Default Connection Strings

All backend files use these defaults:

| Environment | Connection String | Location |
|------------|-------------------|----------|
| Docker Compose | `mongodb://mongo:27017/cep_database` | `docker-compose.yml` |
| Local Development | `mongodb://localhost:27017/cep_database` | `backend/server.js` |
| Seed Scripts | `mongodb://127.0.0.1:27017/cep_database` | All seed scripts |

## Verifying Connection

### Docker Desktop
```bash
# Check containers
docker-compose ps

# Check backend logs
docker-compose logs backend | grep MongoDB
# Should show: ✅ Connected to MongoDB

# Test API
curl http://localhost:4000/api/home
```

### Local Development
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017/cep_database

# Or check backend logs
npm run dev
# Should show: ✅ Connected to MongoDB
```

## Seed Scripts

All seed scripts use local MongoDB by default:

```bash
# From backend directory
npm run seed:all-admins
npm run seed:admin
npm run seed:super-admin
# etc.
```

They will connect to:
- `mongodb://127.0.0.1:27017/cep_database` (if `MONGODB_URI` not set)
- Or use `MONGODB_URI` environment variable if set

## Troubleshooting

### Docker Desktop

**Issue:** Backend can't connect to MongoDB
```bash
# Check if MongoDB container is running
docker-compose ps

# Restart MongoDB
docker-compose restart mongo

# View MongoDB logs
docker-compose logs mongo
```

**Issue:** Port 27017 already in use
```yaml
# Change port in docker-compose.yml
ports:
  - "27018:27017"  # Use 27018 instead
```

### Local Development

**Issue:** MongoDB not running
```bash
# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (Linux/Mac)
sudo systemctl start mongod
# or
mongod --dbpath /path/to/data
```

**Issue:** Connection refused
- Check if MongoDB is running: `mongosh mongodb://localhost:27017`
- Check MongoDB logs
- Verify port 27017 is not blocked by firewall

## Summary

✅ **Docker Desktop:** Already configured - just run `docker-compose up -d`
✅ **Local Development:** Use `mongodb://localhost:27017/cep_database`
✅ **Render:** Use MongoDB Atlas connection string
✅ **All defaults point to local MongoDB** (no Railway references)


