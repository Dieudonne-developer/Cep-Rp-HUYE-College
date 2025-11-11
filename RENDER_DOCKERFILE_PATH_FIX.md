# Render Dockerfile Path Fix

## Error
```
error: invalid local: resolve : lstat /opt/render/project/src/frontend/frontend: no such file or directory
```

## Root Cause
The `dockerfilePath` in `render.yaml` is being resolved **relative to `rootDir`**, not the repo root.

When `rootDir: frontend` is set:
- Render changes working directory to: `/opt/render/project/src/frontend/`
- `dockerfilePath: frontend/Dockerfile` tries to resolve from that directory
- Result: `/opt/render/project/src/frontend/frontend/Dockerfile` ❌ (double `frontend`)

## Solution Applied

### Fixed `dockerfilePath` in `render.yaml`

**Before:**
```yaml
rootDir: frontend
dockerfilePath: frontend/Dockerfile  # ❌ Wrong - resolved relative to rootDir
```

**After:**
```yaml
rootDir: frontend
dockerfilePath: Dockerfile  # ✅ Correct - relative to rootDir
```

## How Render Resolves Paths

### With `rootDir: frontend`:
1. **Working Directory**: `/opt/render/project/src/frontend/`
2. **Dockerfile Path**: `Dockerfile` → Resolved from rootDir → `/opt/render/project/src/frontend/Dockerfile` ✅

### If `rootDir` was not set:
1. **Working Directory**: `/opt/render/project/src/`
2. **Dockerfile Path**: `frontend/Dockerfile` → Resolved from repo root → `/opt/render/project/src/frontend/Dockerfile` ✅

## Verification

After this fix, the build should:
1. ✅ Clone repository successfully
2. ✅ Change to `frontend` directory (rootDir)
3. ✅ Find `Dockerfile` in that directory
4. ✅ Build Docker image correctly
5. ✅ Deploy successfully

## Summary

✅ **Changed `dockerfilePath: frontend/Dockerfile` → `dockerfilePath: Dockerfile`**
✅ **Path is now relative to `rootDir` (frontend)**
✅ **No more double `frontend` path error**

**The error should be fixed after this change!**

