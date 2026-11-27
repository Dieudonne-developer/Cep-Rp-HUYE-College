# CEP User App - Family Screens Implementation Summary

## Overview
This document summarizes the implementation of family-specific screens with bottom tab navigation for the CEP user mobile app.

## Navigation Structure

### Default: CEP (cepier)
- **Tabs**: About, Activities, Support, Ideas, WhatsApp (5 tabs)
- **Screens**: CepAboutScreen, CepActivitiesScreen, CepSupportScreen, CepIdeasScreen, CepWhatsAppScreen

### Choir (choir)
- **Tabs**: About, Media, Activities, Ideas, Support, WhatsApp, Attendance (7 tabs)
- **Screens**: ChoirAboutScreen, ChoirMediaScreen, ChoirActivitiesScreen, ChoirIdeasScreen, ChoirSupportScreen, ChoirWhatsAppScreen, ChoirAttendanceScreen

### Other Families (anointed,ellectual, psalm23, psalm46, protocol, social, evangelical)
- **Tabs**: About, Media, Activities, Ideas, Support, WhatsApp, Attendance (7 tabs)
- **Screens**: FamilyAboutScreen, FamilyMediaScreen, FamilyActivitiesScreen, FamilyIdeasScreen, FamilySupportScreen, FamilyWhatsAppScreen, FamilyAttendanceScreen

## Backend API Endpoints Used

### CEP (cepier)
- `GET /api/assets/logo` - Logo image
- `GET /api/home/activities` - Activities list
- `GET /api/home/support` - Support information
- `GET /api/home/ideas` + `POST /api/home/ideas` - Ideas list and submission
- `GET /api/whatsapp/groups` - WhatsApp groups

### Choir
- `GET /api/choir/songs` - Songs/media (no group param)
- `GET /api/choir/events` - Events/activities (no group param)
- `GET /api/choir/implemented-ideas` - Implemented ideas (no group param)
- `POST /api/choir/ideas` - Submit ideas (no group param)
- `GET /api/home/support/choir` - Choir-specific support info
- `GET /api/whatsapp/groups` - WhatsApp groups
- `GET /api/attendance/me` - User attendance (with Bearer token)

### Other Families (using group query parameter)
- `GET /api/choir/songs?group={group}` - Songs/media
- `GET /api/choir/events?group={group}` - Events/activities
- `GET /api/choir/implemented-ideas?group={group}` - Implemented ideas
- `POST /api/choir/ideas?group={group}` - Submit ideas
- `GET /api/home/support/{group}` - Family-specific support info
- `GET /api/whatsapp/groups` - WhatsApp groups
- `GET /api/attendance/me` - User attendance (with Bearer token)

## Media Screen Features

### YouTube Integration
- **Video Playback**: Uses react-native-webview to embed YouTube videos
- **URL Conversion**: Handles various YouTube URL formats:
  - `youtube.com/watch?v=...`
  - `youtu.be/...`
  - `youtube.com/embed/...`
- **Audio Playback**: Opens audio URLs directly
- **Filtering**: Tabs for All, Videos, Audio with counts

### Image Handling
- **getImageUrl() function**: Handles multiple image field names (`imageUrl`, `image`, `image_url`)
- **URL Prefixing**: Automatically prepends API_BASE_URL for relative paths
- **Activity Images**: Displayed in activity cards and detail modals

## Authentication

### Member Login
- **Endpoint**: `POST /api/auth/login`
- **Payload**: `{ username, password, userGroup }`
- **Response**: `{ success: true, accessToken, user }`
- **Token Storage**: AsyncStorage key `@cep-member-session`

### Attendance
- **Endpoint**: `GET /api/attendance/me`
- **Auth**: Bearer token in Authorization header
- **Response**: Attendance records array

## File Structure

```
src/screens/
├── cep/
│   ├── CepAboutScreen.tsx
│   ├── CepActivitiesScreen.tsx
│   ├── CepSupportScreen.tsx
│   ├── CepIdeasScreen.tsx
│   └── CepWhatsAppScreen.tsx
├── choir/
│   ├── ChoirAboutScreen.tsx
│   ├── ChoirMediaScreen.tsx
│   ├── ChoirActivitiesScreen.tsx
│   ├── ChoirIdeasScreen.tsx
│   ├── ChoirSupportScreen.tsx
│   ├── ChoirWhatsAppScreen.tsx
│   ├── ChoirAttendanceScreen.tsx
│   └── ChoirTabs.tsx
└── families/
    ├── FamilyAboutScreen.tsx
    ├── FamilyMediaScreen.tsx
    ├── FamilyActivitiesScreen.tsx
    ├── FamilyIdeasScreen.tsx
    ├── FamilySupportScreen.tsx
    ├── FamilyWhatsAppScreen.tsx
    ├── FamilyAttendanceScreen.tsx
    └── FamilyTabs.tsx
```

## Dependencies Added
- `react-native-webview@13.10.5` - For YouTube video playback

## Key Features

1. **Consistent Design**: All screens use the same blue header (#2735F5) with hamburger menu
2. **Image Support**: Activities display images from backend
3. **Media Playback**: YouTube videos and audio playback
4. **Group Switching**: Sidebar allows switching between all families
5. **Backend Integration**: All screens communicate with the shared backend API
6. **Attendance**: User-specific attendance tracking with authentication

## Notes
- The `choir` endpoints are reused for all families with the `?group=` query parameter
- CEP uses global endpoints (`/api/home/`) instead of group-specific endpoints
- WhatsApp groups are currently shared across all families (may need family-specific filtering in the future)
