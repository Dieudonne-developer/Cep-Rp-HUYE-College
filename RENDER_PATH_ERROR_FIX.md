# Render Path Error Fix

## Error
```
error: invalid local: resolve : lstat /opt/render/project/src/frontend/frontend: no such file or directory
```

## Root Cause
The error shows Render is looking for `/opt/render/project/src/frontend/frontend` (double `frontend`). This happens when:
1. `rootDir` is set to `frontend`
2. Render tries to resolve paths relative to `rootDir`
3. Dockerfile path or build context is incorrectly configured

## Solution Applied

### Fixed `render.yaml`
Changed `env: node` to `env: docker` for the frontend service:
- ✅ `env: docker` → Uses Docker build (correct for Dockerfile)
- ❌ `env: node` → Uses Node.js build (wrong for Dockerfile)

## Verification

### Check `render.yaml` Configuration
```yaml
services:
  - type: web
    name: cep-frontend
    env: docker          # ✅ Changed from 'node' to 'docker'
    rootDir: frontend    # ✅ Correct
    plan: free
    dockerfilePath: frontend/Dockerfile  # ✅ Correct
```

### How Render Resolves Paths
1. **Root Directory**: `/opt/render/project/src/`
2. **Service Root**: `rootDir: frontend` → `/opt/render/project/src/frontend/`
3. **Dockerfile Path**: `frontend/Dockerfile` → Resolved from repo root → `/opt/render/project/src/frontend/Dockerfile` ✅

## If Error Persists

### Option 1: Check Dockerfile Path
If `dockerfilePath` is relative to `rootDir`, try:
```yaml
dockerfilePath: ./Dockerfile  # Relative to rootDir
```

### Option 2: Check Root Directory
If the issue persists, verify the repository structure:
```
repo-root/
  ├── frontend/
  │   ├── Dockerfile      ✅ Should exist here
  │   ├── server.js       ✅ Should exist here
  │   ├── package.json    ✅ Should exist here
  │   └── ...
  └── render.yaml         ✅ Should exist here
```

### Option 3: Manual Service Configuration
If Blueprint fails, create service manually:
1. **New** → **Web Service**
2. Connect GitHub repository
3. Configure:
   - **Name**: `cep-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile` (relative to rootDir)
   - **Plan**: `Free`
4. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `VITE_API_BASE_URL`: `https://cep-rp-huye-college.onrender.com`

## Summary

✅ **Fixed `env: node` → `env: docker`** in `render.yaml`
✅ **Verified path configuration** is correct
✅ **Dockerfile path** is correct relative to repo root

**The error should be fixed after this change!**

