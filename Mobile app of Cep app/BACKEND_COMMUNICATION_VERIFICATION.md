# CEP User App - Complete Backend Communication Verification

## App Structure Overview

The CEP user app has a variant-based architecture:
- **User variant** (`EXPO_PUBLIC_APP_VARIANT=user`): Normal user app with member authentication
- **Admin variant** (`EXPO_PUBLIC_APP_VARIANT=admin`): Admin app with admin authentication

## Navigation Structure

### Main Flow
1. **Welcome Screen** → First launch only
2. **Member Login** → JWT authentication via `/api/auth/login`
3. **Main Tabs** → Home, Attendance, Activities, Settings
4. **Home Screen** → Drawer navigation with group selection

### Group Navigation (Drawer Sidebar)
- **CEP (cepier)**: 5 tabs - About, Activities, Support, Ideas, WhatsApp
- **Choir**: 7 tabs - About, Media, Activities, Ideas, Support, WhatsApp, Attendance
- **Anointed**: 7 tabs - About, Media, Activities, Ideas, Support, WhatsApp, Attendance
- **Abanyamugisha**: 6 tabs - About, Media, Activities, Prayer Requests, Support, WhatsApp
- **Psalm23, Psalm46, Protocol, Social, Evangelical**: 6 tabs - About, Media, Activities, Ideas, Support, WhatsApp

## Backend API Endpoints by Screen

### CEP Screens (cepier)

#### CepAboutScreen
- `GET /api/assets/logo` - CEP logo image
- Status: ✅ Correct

#### CepActivitiesScreen
- `GET /api/home/activities` - Global activities list
- Image handling: `getImageUrl()` helper
- Status: ✅ Correct

#### CepSupportScreen
- `GET /api/home/support` - Global support info
- Response: `{ success: true, support: { bank: {...}, mobileMoney: {...} } }`
- Status: ✅ Correct

#### CepIdeasScreen
- `GET /api/home/ideas` - Implemented ideas list
- `POST /api/home/ideas` - Submit new idea
- Payload: `{ idea, name, email, category, anonymous }`
- Status: ✅ Correct

#### CepWhatsAppScreen
- `GET /api/whatsapp/groups` - WhatsApp groups list
- Status: ✅ Correct

### Choir Screens

#### ChoirAboutScreen
- Static content (no API call)
- Status: ✅ Correct

#### ChoirMediaScreen
- `GET /api/choir/songs` - Songs/media (no group param = choir default)
- YouTube video playback via WebView
- Status: ✅ Correct

#### ChoirActivitiesScreen
- `GET /api/choir/events` - Choir events/activities
- Image handling: `getImageUrl()` helper
- Status: ✅ Correct

#### ChoirIdeasScreen
- `GET /api/choir/implemented-ideas` - Implemented ideas
- `POST /api/choir/ideas` - Submit ideas
- Status: ✅ Correct

#### ChoirSupportScreen
- `GET /api/home/support/choir` - Choir-specific support info
- Status: ✅ Correct

#### ChoirWhatsAppScreen
- `GET /api/whatsapp/groups` - WhatsApp groups
- Status: ✅ Correct

#### ChoirAttendanceScreen
- `GET /api/attendance/me` - User attendance
- Auth: Bearer token in Authorization header
- Status: ✅ Correct

### Anointed Screens

#### AnointedAboutScreen
- Static content (no API call)
- Status: ✅ Correct

#### AnointedMediaScreen
- `GET /api/choir/songs?group=anointed` - Anointed songs/media
- YouTube video playback via WebView
- Status: ✅ Correct

#### AnointedActivitiesScreen
- `GET /api/choir/events?group=anointed` - Anointed events/activities
- Image handling: `getImageUrl()` helper
- Status: ✅ Correct

#### AnointedIdeasScreen
- `GET /api/choir/implemented-ideas?group=anointed` - Implemented ideas
- `POST /api/choir/ideas?group=anointed` - Submit ideas
- Status: ✅ Correct

#### AnointedSupportScreen
- `GET /api/home/support/anointed` - Anointed-specific support info
- Status: ✅ Correct

#### AnointedWhatsAppScreen
- `GET /api/whatsapp/groups` - WhatsApp groups
- Status: ✅ Correct

#### AnointedAttendanceScreen
- `GET /api/attendance/me` - User attendance
- Auth: Bearer token in Authorization header
- Status: ✅ Correct

### Abanyamugisha Screens

#### AbanyamugishaAboutScreen
- Static content (no API call)
- Status: ✅ Correct

#### AbanyamugishaMediaScreen
- `GET /api/choir/songs?group=abanyamugisha` - Abanyamugisha songs/media
- YouTube video playback via WebView
- Status: ✅ Correct

#### AbanyamugishaActivitiesScreen
- `GET /api/choir/events?group=abanyamugisha` - Abanyamugisha events/activities
- Image handling: `getImageUrl()` helper
- Status: ✅ Correct

#### AbanyamugishaPrayerRequestsScreen
- `GET /api/prayer-requests?group=abanyamugisha` - Prayer requests list
- `POST /api/prayer-requests` - Submit prayer request
- Payload: `{ name, request, category, anonymous, group, userId, username }`
- Auth: Optional Bearer token for user association
- Status: ✅ Correct (backend endpoint created)

#### AbanyamugishaSupportScreen
- `GET /api/home/support/abanyamugisha` - Abanyamugisha-specific support info
- Status: ✅ Correct

#### AbanyamugishaWhatsAppScreen
- `GET /api/whatsapp/groups` - WhatsApp groups
- Status: ✅ Correct

### Other Families (Psalm23, Psalm46, Protocol, Social, Evangelical)

All use FamilyTabs6 with the following screens:

#### FamilyAboutScreen
- Static content (no API call)
- Status: ✅ Correct

#### FamilyMediaScreen
- `GET /api/choir/songs?group={group}` - Family songs/media
- YouTube video playback via WebView
- Status: ✅ Correct

#### FamilyActivitiesScreen
- `GET /api/choir/events?group={group}` - Family events/activities
- Image handling: `getImageUrl()` helper
- Status: ✅ Correct

#### FamilyIdeasScreen
- `GET /api/choir/implemented-ideas?group={group}` - Implemented ideas
- `POST /api/choir/ideas?group={group}` - Submit ideas
- Status: ✅ Correct

#### FamilySupportScreen
- `GET /api/home/support/{group}` - Family-specific support info
- Status: ✅ Correct

#### FamilyWhatsAppScreen
- `GET /api/whatsapp/groups` - WhatsApp groups
- Status: ✅ Correct

### Member Screens (Main Tabs)

#### AttendanceScreen
- `GET /api/attendance/me` - User attendance
- Auth: Bearer token in Authorization header
- Status: ✅ Correct

#### ActivitiesScreen
- `GET /api/home/activities` - Global activities
- `GET /api/whatsapp/groups` - WhatsApp groups
- Image handling: `getImageUrl()` helper
- Status: ✅ Correct

#### SettingsScreen
- User profile display and logout
- Status: ✅ Correct

## Authentication Flow

### Member Login
- **Endpoint**: `POST /api/auth/login`
- **Payload**: `{ username, password, userGroup }`
- **Response**: `{ success: true, accessToken, user }`
- **Token Storage**: AsyncStorage key `@cep-member-session`
- **Status**: ✅ Correct

### Attendance Authentication
- **Header**: `Authorization: Bearer {accessToken}`
- **Endpoint**: `GET /api/attendance/me`
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
- Handles multiple image field names
- Prepends API_BASE_URL for relative paths
- Status: ✅ Correct

## API Base URL Configuration

- **Source**: `API_BASE_URL` from `@/config/api.ts`
- **Priority**:
  1. `EXPO_PUBLIC_API_BASE_URL` (build-time env var)
  2. `extra.apiBaseUrl` from app.json
  3. Fallback: `https://cep-rp-huye-college-yt6x-eight.vercel.app`
- **Status**: ✅ Correct

## New Backend Endpoints Added

### Prayer Requests
- **Model**: `backend/models/PrayerRequest.js`
- **Route**: `backend/routes/prayer-requests.js`
- **Endpoints**:
  - `GET /api/prayer-requests?group={group}` - Get prayer requests by group
  - `POST /api/prayer-requests` - Submit prayer request
- **Registered in**: `server.js` at `/api/prayer-requests`
- **Status**: ✅ Correct

## Dependencies

- `react-native-webview@13.10.5` - For YouTube video playback
- `@react-navigation/drawer@7.14.5` - For sidebar navigation
- `@react-navigation/bottom-tabs` - For bottom tab navigation

## Summary

All screens in the CEP user app are correctly communicating with the backend:
- ✅ All API endpoints are properly configured
- ✅ Group-specific parameters are correctly passed
- ✅ Authentication is properly handled for protected endpoints
- ✅ Image URLs are properly resolved
- ✅ YouTube video playback is integrated
- ✅ New prayer requests endpoint is created and registered

The app structure is well-organized with:
- Clear separation between CEP, Choir, Anointed, Abanyamugisha, and other families
- Consistent UI patterns across all screens
- Proper backend communication for all data fetching
- Appropriate tab counts per family requirements
