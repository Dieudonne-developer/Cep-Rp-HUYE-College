# Backend API Verification for CEP User App

## CEP-Specific Screens

### 1. CepAboutScreen
- **API Endpoint**: `GET /api/assets/logo`
- **Purpose**: Fetch CEP logo image
- **Status**: ✅ Correct

### 2. CepActivitiesScreen
- **API Endpoint**: `GET /api/home/activities`
- **Purpose**: Fetch global activities list
- **Image Handling**: `getImageUrl()` helper function handles:
  - Full HTTP/HTTPS URLs (returned as-is)
  - Relative paths (prepends API_BASE_URL)
  - Multiple field names: `imageUrl`, `image`, `image_url`
- **Status**: ✅ Correct with image support

### 3. CepSupportScreen
- **API Endpoint**: `GET /api/home/support`
- **Purpose**: Fetch support information (bank, mobile money)
- **Response Structure**: `{ success: true, support: { bank: {...}, mobileMoney: {...} } }`
- **Status**: ✅ Correct

### 4. CepIdeasScreen
- **GET Endpoint**: `GET /api/home/ideas`
- **Purpose**: Fetch implemented ideas list
- **Response Structure**: `{ success: true, data: [...] }`
- **POST Endpoint**: `POST /api/home/ideas`
- **Purpose**: Submit new idea
- **Payload**: `{ idea, name, email, category, anonymous }`
- **Status**: ✅ Correct

### 5. CepWhatsAppScreen
- **API Endpoint**: `GET /api/whatsapp/groups`
- **Purpose**: Fetch WhatsApp groups list
- **Response Structure**: `{ success: true, groups: [...] }`
- **Field Names**: `inviteLink` or `invite_link`
- **Status**: ✅ Correct

## Other Screens

### 6. GroupContentScreen (non-CEP families)
- **Activities**: `GET /api/home/activities`
- **WhatsApp**: `GET /api/whatsapp/groups`
- **Image Handling**: Same `getImageUrl()` helper as CepActivitiesScreen
- **Status**: ✅ Correct

### 7. AttendanceScreen
- **API Endpoint**: `GET /api/attendance/me`
- **Auth**: Bearer token in Authorization header
- **Status**: ✅ Correct

### 8. ActivitiesScreen (bottom tab)
- **Activities**: `GET /api/home/activities`
- **WhatsApp**: `GET /api/whatsapp/groups`
- **Status**: ✅ Correct

## Authentication

### Member Login
- **API Endpoint**: `POST /api/auth/login`
- **Payload**: `{ username, password, userGroup }`
- **Response**: `{ success: true, accessToken, user }`
- **Token Storage**: AsyncStorage with key `@cep-member-session`
- **Status**: ✅ Correct

## Helper Functions

### getImageUrl(activity)
```typescript
const getImageUrl = (activity: any) => {
  const imageUrl = activity.imageUrl || activity.image || activity.image_url;
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};
```
- Handles various image URL formats
- Prepends API_BASE_URL for relative paths
- Returns null if no image URL found

## API Base URL Configuration
- **Source**: `API_BASE_URL` from `@/config/api.ts`
- **Priority**:
  1. `EXPO_PUBLIC_API_BASE_URL` (build-time env var)
  2. `extra.apiBaseUrl` from app.json
  3. Fallback: `https://cep-rp-huye-college-yt6x-eight.vercel.app`
- **Status**: ✅ Correct

## Summary
All backend communications are correctly configured. Image URLs are properly handled with the `getImageUrl()` helper function that supports multiple field name variations and URL formats.
