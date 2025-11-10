# CEP Database Configuration Summary

## Unified Database Setup
The CEP system now uses a single, unified MongoDB database: **`cep_database`**

## Database Connection
- **Database Name**: `cep_database`
- **Connection String**: `mongodb://localhost:27017/cep_database`
- **Configuration File**: `backend/.env`

## Collections in cep_database

### 1. User Registrations
- **Collection**: `userregistrations`
- **Model**: `UserRegistration.js`
- **Purpose**: Store user registration data, verification tokens, and passwords
- **Fields**: email, username, profileImage, isVerified, verificationToken, password, createdAt

### 2. Songs
- **Collection**: `songs`
- **Model**: `Song.js`
- **Purpose**: Store choir songs and media files
- **Fields**: title, artist, description, fileUrl, url, thumbnailUrl, thumbnail, mediaType, duration, downloadable, category, createdAt, updatedAt

### 3. Events
- **Collection**: `events`
- **Model**: `Event.js`
- **Purpose**: Store choir events and activities
- **Fields**: title, description, date, location, imageUrl, createdAt, updatedAt

## API Endpoints

### User Management
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Email verification
- `POST /api/auth/set-password` - Password setup
- `GET /api/debug/users` - Debug user data

### Songs Management
- `GET /api/choir/songs` - Get all songs
- `POST /api/admin/songs` - Create song (admin)
- `PUT /api/admin/songs/:id` - Update song (admin)
- `DELETE /api/admin/songs/:id` - Delete song (admin)

### Events Management
- `GET /api/choir/events` - Get all events
- `POST /api/admin/events` - Create event (admin)
- `PUT /api/admin/events/:id` - Update event (admin)
- `DELETE /api/admin/events/:id` - Delete event (admin)

## Environment Configuration
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cep_database

# Server Configuration
PORT=4000
NODE_ENV=development

# Email Configuration
EMAIL_USER=elyseemusabyimana5@gmail.com
EMAIL_APP_PASSWORD=your-app-password-here

# Client Origin
CLIENT_ORIGIN=http://localhost:5173

# JWT Secret
JWT_SECRET=cep-jwt-secret-key-2024

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

## How to Start the Server
```bash
cd backend
npm start
```

## Database Status
✅ **UNIFIED**: All collections now use `cep_database`
✅ **CONNECTED**: MongoDB connection working
✅ **TESTED**: All API endpoints functional
✅ **CONFIGURED**: Environment variables set correctly

## Benefits of Unified Database
1. **Simplified Management**: Single database to maintain
2. **Consistent Data**: All related data in one place
3. **Easier Backups**: One database to backup
4. **Better Performance**: No cross-database queries
5. **Reduced Complexity**: Simpler deployment and configuration



