# Render Static Site Routing Fix

## Problem

When navigating to routes like `/anointed`, `/psalm23`, etc. on the Render static site, you get 404 errors because:
1. The static server tries to find a file at that path
2. The file doesn't exist (it's a client-side route)
3. The server returns 404

## Solution Implemented

### 1. Fixed Client-Side Navigation
- **File**: `frontend/src/pages/FamiliesPage.tsx`
- **Change**: Replaced `window.location.href` with React Router's `navigate()` function
- **Result**: Links now use client-side navigation instead of full page reloads

### 2. Added Redirects File
- **File**: `frontend/public/_redirects`
- **Content**: `/*    /index.html   200`
- **Purpose**: Tells the server to serve `index.html` for all routes (for direct navigation/refresh)

## How It Works

### Before (Causing 404s):
```typescript
function navigateTo(link?: string) {
  window.location.href = link  // Full page reload → 404 error
}
```

### After (Fixed):
```typescript
function navigateTo(link?: string) {
  navigate(link)  // Client-side navigation → No 404
}
```

## Render Configuration

For Render static sites, you may need to configure the service to handle SPA routing:

1. **Option 1**: The `_redirects` file should work if Render supports it
2. **Option 2**: Configure Render static site settings:
   - Go to Render Dashboard → Your Static Site
   - Look for "Redirects" or "SPA Routing" settings
   - Enable "Single Page Application" mode or add redirect rules

## Testing

1. **Click Navigation**: Click on family links from `/families` page
   - Should navigate without page reload
   - Should not show 404 errors

2. **Direct Navigation**: Type URL directly (e.g., `/anointed`)
   - Should load the page correctly
   - May need Render configuration if `_redirects` doesn't work

3. **Refresh**: Refresh the page on `/anointed`
   - Should stay on the page
   - May need Render configuration if `_redirects` doesn't work

## Favicon 404

The favicon 404 error is minor and can be fixed by:
1. Adding a `favicon.ico` file to `frontend/public/`
2. Or updating `index.html` to point to the existing `favicon.svg`

## Next Steps

1. **Push and Deploy**:
   ```bash
   git add .
   git commit -m "Fix SPA routing for Render static site"
   git push origin main
   ```

2. **Verify on Render**:
   - After deployment, test clicking family links
   - Test direct navigation to routes
   - If direct navigation still fails, configure Render static site settings

3. **Optional - Configure Render**:
   - If `_redirects` doesn't work, check Render documentation for SPA routing configuration
   - May need to add custom redirect rules in Render dashboard

## Files Changed

- `frontend/src/pages/FamiliesPage.tsx` - Fixed navigation to use React Router
- `frontend/public/_redirects` - Added redirect rules for static site

