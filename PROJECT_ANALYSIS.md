# CEP Huye College - Complete Project Analysis

## 📋 Project Overview

**Project Name:** CEP Huye College App  
**Type:** Full-stack web application  
**Purpose:** Community management platform for CEP Huye College with multi-family group support

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js v5.1.0
- **Database:** MongoDB with Mongoose v8.18.1
- **Real-time:** Socket.IO v4.8.1
- **Authentication:** bcrypt/bcryptjs, JWT
- **File Upload:** Multer v2.0.2
- **Email:** Nodemailer v7.0.10
- **Security:** Helmet, CORS
- **Logging:** Morgan

**Frontend:**
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite v7.1.7
- **Routing:** React Router DOM v6.28.0
- **Icons:** Lucide React v0.547.0
- **HTTP Client:** Axios v1.12.2
- **Real-time:** Socket.IO Client v4.8.1
- **Styling:** Tailwind CSS (via CDN/classes)

**Database:**
- **Type:** MongoDB
- **Database Name:** `cep_database`
- **Connection:** `mongodb://localhost:27017/cep_database`

---

## 👥 User Management System

### User Models (9 Family Groups)

1. **UserRegistration** (Choir) - `choir_users` collection
2. **CepierUser** - `cepier_users` collection
3. **AnointedUser** - `anointed_users` collection
4. **AbanyamugishaUser** - `abanyamugisha_users` collection
5. **Psalm23User** - `psalm23_users` collection
6. **Psalm46User** - `psalm46_users` collection
7. **ProtocolUser** - `protocol_users` collection
8. **SocialUser** - `social_users` collection
9. **EvangelicalUser** - `evangelical_users` collection

### User Schema Structure (All Models)
```javascript
{
  email: String (required, unique)
  username: String (required, unique)
  password: String (hashed)
  profileImage: String (URL)
  role: Enum ['super-admin', 'admin', 'editor', 'viewer'] (default: 'viewer')
  adminGroup: String (default: group name)
  userGroup: String (default: group name)
  isVerified: Boolean (default: false)
  isApproved: Boolean (default: false)
  verificationToken: String
  createdAt: Date
  approvedAt: Date
  approvedBy: String
}
```

### Role Hierarchy
- **super-admin:** Full system access, can manage all groups
- **admin:** Group-specific admin access
- **editor:** Can edit content within their group
- **viewer:** Read-only access

---

## 🗂️ Database Collections

### User Collections (9)
- `choir_users` (UserRegistration)
- `cepier_users`
- `anointed_users`
- `abanyamugisha_users`
- `psalm23_users`
- `psalm46_users`
- `protocol_users`
- `social_users`
- `evangelical_users`

### Content Collections (Per Group - 9 groups × 3 types = 27 collections)
**Songs:**
- `choir_songs`, `anointed_songs`, `abanyamugisha_songs`, `psalm23_songs`, `psalm46_songs`, `protocol_songs`, `social_songs`, `evangelical_songs`

**Events:**
- `choir_events`, `anointed_events`, `abanyamugisha_events`, `psalm23_events`, `psalm46_events`, `protocol_events`, `social_events`, `evangelical_events`

**Ideas:**
- `choir_implemented_ideas`, `anointed_implemented_ideas`, `abanyamugisha_implemented_ideas`, `psalm23_implemented_ideas`, `psalm46_implemented_ideas`, `protocol_implemented_ideas`, `social_implemented_ideas`, `evangelical_implemented_ideas`

### Global Collections (3)
- `global_events` - Homepage activities
- `global_ideas` - Public ideas/suggestions
- `global_support` - Support page information (singleton)

### Other Collections
- `chat_messages` - Real-time chat messages (grouped by family)

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration with email verification
- `GET /verify` - Email verification
- `GET /set-password` - Password setup page
- `POST /set-password` - Set password after verification
- `POST /login` - User login
- `GET /user/:username` - Get user profile
- `POST /forgot-password` - Request password reset
- `POST /verify-code` - Verify reset code
- `POST /reset-password` - Reset password

### Admin Routes (`/api/admin`)
**Authentication:**
- `POST /login` - Admin login
- `POST /reset-password` - Reset admin password

**Dashboard:**
- `GET /dashboard` - Admin dashboard stats

**Songs Management:**
- `GET /songs` - Get all songs (group-specific)
- `POST /songs` - Create song
- `PUT /songs/:id` - Update song
- `DELETE /songs/:id` - Delete song
- `POST /songs/upload` - Upload song file

**Events Management:**
- `GET /events` - Get all events (group-specific)
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /events/upload` - Upload event image

**Members Management:**
- `GET /members` - Get all members
- `GET /members/pending` - Get pending approvals
- `POST /members/:id/approve` - Approve member
- `POST /members/:id/reject` - Reject member

**Ideas Management:**
- `GET /ideas` - Get all ideas
- `PUT /ideas/:id` - Update idea (implement)

**Super Admin Routes:**
- `GET /super-admins` - Get all admins across groups
- `POST /super-admins/create` - Create new admin
- `PUT /super-admins/:id/suspend` - Suspend admin
- `PUT /super-admins/:id/approve` - Approve admin
- `DELETE /super-admins/:id` - Delete admin

**Super Admin Homepage Management:**
- `GET /super-admin/home/activities` - Get global activities
- `POST /super-admin/home/activities` - Create global activity
- `PUT /super-admin/home/activities/:id` - Update global activity
- `DELETE /super-admin/home/activities/:id` - Delete global activity
- `GET /super-admin/home/ideas` - Get global ideas
- `PUT /super-admin/home/ideas/:id/implement` - Mark idea as implemented
- `DELETE /super-admin/home/ideas/:id` - Delete global idea
- `GET /super-admin/home/support` - Get support information
- `PUT /super-admin/home/support` - Update support information

### Choir/Public Routes (`/api/choir`)
- `GET /songs` - Get songs (group-specific)
- `GET /events` - Get events (group-specific)
- `GET /implemented-ideas` - Get implemented ideas
- `POST /ideas` - Submit new idea

### Home/Public Routes (`/api/home`)
- `GET /activities` - Get global activities (for /activities page)
- `GET /ideas` - Get implemented global ideas
- `POST /ideas` - Submit global idea
- `GET /support` - Get support information (for /support page)

### Chat Routes (`/api/chat`)
- `GET /messages` - Get chat messages (group-filtered)
- `POST /messages` - Send chat message
- `POST /upload` - Upload file for chat
- `GET /users/online` - Get online users

---

## 📁 Project Structure

```
Cep/
├── backend/
│   ├── models/              # 35+ Mongoose models
│   │   ├── UserRegistration.js
│   │   ├── CepierUser.js
│   │   ├── [8 other user models]
│   │   ├── Song.js, Event.js, ImplementedIdea.js
│   │   ├── [24 group-specific content models]
│   │   ├── GlobalEvent.js, GlobalIdea.js, GlobalSupport.js
│   │   └── ChatMessage.js
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication & registration
│   │   ├── admin.js         # Admin operations
│   │   ├── choir.js         # Public choir/family endpoints
│   │   ├── init.js          # Homepage/public endpoints
│   │   ├── chat.js          # Chat functionality
│   │   ├── activities.js    # Legacy activities
│   │   ├── ideas.js         # Legacy ideas
│   │   └── support.js       # Legacy support
│   ├── middleware/          # Express middleware
│   │   ├── cors.js          # CORS configuration
│   │   ├── security.js      # Helmet configuration
│   │   └── upload.js        # Multer file upload
│   ├── utils/               # Utility functions
│   │   ├── auth.js          # Authentication helpers
│   │   ├── email.js         # Email sending (Nodemailer)
│   │   ├── passwordReset.js # Password reset logic
│   │   └── file.js          # File handling
│   ├── uploads/             # Uploaded files (images, audio)
│   ├── logs/                # Application logs
│   ├── scripts/             # Utility scripts
│   ├── seed-*.js            # Database seeding scripts
│   ├── server.js            # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # React page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── FamiliesPage.tsx
│   │   │   ├── ActivitiesPage.tsx
│   │   │   ├── SupportPage.tsx
│   │   │   ├── IdeasPage.tsx
│   │   │   ├── ChatHubPage.tsx
│   │   │   ├── CepRegisterPage.tsx
│   │   │   ├── CepMembersPage.tsx
│   │   │   ├── MemberPage.tsx
│   │   │   ├── [Family Pages]/
│   │   │   │   ├── Anointed/Page.tsx
│   │   │   │   ├── Abanyamugisha/Page.tsx
│   │   │   │   ├── Psalm23/Page.tsx
│   │   │   │   ├── Psalm46/Page.tsx
│   │   │   │   ├── Protocol/Page.tsx
│   │   │   │   ├── Social/Page.tsx
│   │   │   │   └── Evangelical/Page.tsx
│   │   │   └── Ishyangaryera Choir/
│   │   │       ├── ChoirPage.tsx
│   │   │       ├── ChatPage.tsx
│   │   │       ├── RegisterPage.tsx
│   │   │       ├── ForgotPasswordPage.tsx
│   │   │       └── admin/
│   │   │           ├── AdminLayout.tsx
│   │   │           ├── AdminLogin.tsx
│   │   │           ├── AdminDashboard.tsx
│   │   │           ├── AdminEvents.tsx
│   │   │           ├── AdminSongs.tsx
│   │   │           ├── AdminMembers.tsx
│   │   │           ├── AdminIdeas.tsx
│   │   │           ├── AdminSuperAdmins.tsx
│   │   │           └── SuperAdminDashboard.tsx
│   │   ├── utils/
│   │   │   └── lucideIcons.ts  # Icon initialization
│   │   ├── main.tsx         # React entry point
│   │   └── style.css        # Global styles
│   ├── public/
│   ├── dist/                # Production build
│   └── package.json
│
└── README.md
```

---

## 🎯 Key Features

### 1. Multi-Family Group System
- **9 Family Groups:**
  1. Ishyanga Ryera Choir
  2. CEPier (General)
  3. Anointed Worship Team
  4. Abanyamugisha Family
  5. Psalm 23 Family
  6. Psalm 46 Family
  7. Protocol Family
  8. Social Family
  9. Evangelical Family

- Each group has:
  - Independent user management
  - Own songs, events, and ideas
  - Group-specific chat rooms
  - Admin dashboard

### 2. User Registration & Authentication
- Email-based registration
- Email verification required
- Admin approval required for chat access
- Password reset functionality
- Profile image upload

### 3. Admin System
- **Group Admins:** Manage their specific family group
- **Super Admin:** Manages all groups and global content
- Admin dashboards for:
  - Events management
  - Songs management
  - Members approval
  - Ideas review
  - Content moderation

### 4. Real-Time Chat
- Group-specific chat rooms
- Online user tracking
- File attachments
- Voice notes support
- Message history
- Typing indicators

### 5. Content Management
**Songs:**
- Upload audio files
- Metadata (title, artist, description)
- Thumbnail images
- Downloadable option

**Events:**
- Create/edit/delete events
- Image uploads
- Date/time/location
- Status tracking (upcoming, ongoing, completed, cancelled)

**Ideas:**
- Submit suggestions
- Admin review and implementation
- Anonymous submissions

### 6. Global Homepage Management (Super Admin)
- **Activities:** Global events displayed on `/activities` page
- **Ideas:** Public idea submissions
- **Support:** Financial support information for `/support` page
- **CEPier Members:** Approve/reject CEPier user registrations

### 7. Public Pages
- `/` - Homepage
- `/families` - Family groups overview
- `/activities` - Global activities (upcoming/past)
- `/support` - Support/donation information
- `/ideas` - Public ideas
- `/chat` - Chat hub
- `/register` - CEP-wide registration
- `/choir`, `/anointed`, etc. - Family-specific pages

---

## 🔐 Security Features

1. **Password Hashing:** bcrypt with salt rounds
2. **Email Verification:** Token-based verification
3. **Admin Approval:** Two-step user activation
4. **Role-Based Access:** Hierarchical permissions
5. **CORS Protection:** Configured origins
6. **Helmet Security:** HTTP headers protection
7. **File Upload Validation:** Multer with size limits
8. **Input Validation:** Request validation
9. **JWT Tokens:** For authentication (prepared)

---

## 📡 Real-Time Features (Socket.IO)

### Socket Events
- `set-username` - Join chat with username and group
- `join-room` - Join specific chat room
- `send-message` - Send chat message
- `receive-message` - Receive message broadcast
- `user-typing` - Typing indicator
- `user-stop-typing` - Stop typing indicator
- `user-joined` - User joined notification
- `user-left` - User left notification
- `online-users-updated` - Online users list update

### Group Rooms
- Each family group has its own chat room: `{group}-chat`
- Examples: `choir-chat`, `cepier-chat`, `anointed-chat`, etc.

---

## 🗄️ Data Flow Patterns

### User Registration Flow
1. User submits registration form
2. System creates user with `isVerified: false`
3. Verification email sent with token
4. User clicks email link → verifies email
5. User sets password
6. Admin approves user (`isApproved: true`)
7. User can now login and access chat

### Event Creation Flow (Group Admin)
1. Admin creates event via `/admin/events`
2. Event saved to group-specific collection
3. Event displayed on group's public page
4. Event can be edited/deleted by admin

### Global Activity Flow (Super Admin)
1. Super admin creates activity via `/admin/super-admins?tab=homepage&global=activities`
2. Activity saved to `global_events` collection
3. Activity displayed on public `/activities` page
4. Activities split into "Upcoming" and "Past" based on date

### Support Page Flow
1. Super admin updates support info via `/admin/super-admins?tab=homepage&global=support`
2. Data saved to `global_support` collection (singleton)
3. Public `/support` page fetches and displays data
4. Changes reflect immediately

---

## 🔄 Current Implementation Status

### ✅ Completed Features
- Multi-group user system (9 groups)
- User registration with email verification
- Admin approval system
- Group-specific admin dashboards
- Super admin system
- Real-time chat with Socket.IO
- Songs management (upload, CRUD)
- Events management (CRUD)
- Ideas submission and review
- Global homepage management
- Support page (dynamic from database)
- File uploads (images, audio)
- Password reset functionality
- Profile images
- Online user tracking

### 🔧 Recent Updates
- Super admin must be CEPier member (enforced)
- CEPier members approval system
- Dynamic support page
- Global activities management
- Enhanced admin UI

---

## 📝 Important Notes

### Super Admin Requirements
- **MUST** be a CEPier family member
- Can manage all groups
- Can create admins for any group
- Can manage global homepage content
- Can approve/reject CEPier members

### Group Isolation
- Each family group has separate:
  - User collection
  - Songs collection
  - Events collection
  - Ideas collection
  - Chat room

### Data Relationships
- Users belong to one primary group (`userGroup`, `adminGroup`)
- Content is group-specific (songs, events, ideas)
- Global content (activities, ideas, support) is shared across all groups
- Chat messages are grouped by family

### File Storage
- Uploads stored in `backend/uploads/`
- Served via `/uploads` static route
- Supports: images (JPG, PNG), audio (MP3)

---

## 🚀 Development Commands

### Backend
```bash
npm run dev          # Development with nodemon
npm start            # Production
npm run seed         # Seed database
npm run seed:super-admin  # Create super admin
npm run migrate:super-admin  # Migrate super admin to CEPier
```

### Frontend
```bash
npm run dev          # Development server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 🔍 Key Patterns & Conventions

### Group Resolution
- Groups resolved from: `X-Admin-Group` header → query param → user's `adminGroup`
- Default group: `choir`

### Model Selection Pattern
```javascript
function getUserModelForGroup(group) {
  if (group === 'cepier') return CepierUser;
  if (group === 'anointed') return AnointedUser;
  // ... etc
  return ChoirUser; // default
}
```

### API Response Format
```javascript
{
  success: boolean,
  message?: string,
  data?: any,
  error?: string
}
```

### Frontend State Management
- Local state with React hooks
- localStorage for admin session
- No global state management library

---

## 📊 Database Schema Summary

### User Models (All Similar)
- Email, username (unique)
- Password (hashed)
- Profile image URL
- Role (enum)
- Group assignments
- Verification/approval flags
- Timestamps

### Content Models (Songs, Events, Ideas)
- Group-specific collections
- Title, description
- Dates, locations
- File URLs
- Metadata
- Owner tracking

### Global Models
- **GlobalEvent:** Homepage activities
- **GlobalIdea:** Public suggestions
- **GlobalSupport:** Support page data (singleton)

### Chat Model
- User, message
- Group assignment
- Timestamps
- File attachments
- Voice notes

---

## 🎨 Frontend Routing

### Public Routes
- `/` - HomePage
- `/families` - FamiliesPage
- `/activities` - ActivitiesPage (global events)
- `/support` - SupportPage (dynamic from DB)
- `/ideas` - IdeasPage
- `/chat` - ChatHubPage
- `/register` - CepRegisterPage
- `/member` - MemberPage

### Family-Specific Routes
- `/choir` - ChoirPage
- `/anointed` - AnointedPage
- `/abanyamugisha` - AbanyamugishaPage
- `/psalm23` - Psalm23Page
- `/psalm46` - Psalm46Page
- `/protocol` - ProtocolPage
- `/social` - SocialPage
- `/evangelical` - EvangelicalPage

### Admin Routes
- `/admin/login` - AdminLogin
- `/admin/dashboard` - AdminDashboard
- `/admin/events` - AdminEvents
- `/admin/songs` - AdminSongs
- `/admin/members` - AdminMembers
- `/admin/ideas` - AdminIdeas
- `/admin/super-admins` - AdminSuperAdmins
- `/admin/super-admin-dashboard` - SuperAdminDashboard

### Chat Routes
- `/choir/chat`, `/anointed/chat`, etc. - Group-specific chat

### Registration Routes
- `/choir/register`, `/anointed/register`, etc. - Group-specific registration
- `/register` - CEP-wide registration

---

## 🔑 Authentication Flow

1. **Registration:**
   - User fills form → Email verification sent
   - User verifies email → Sets password
   - Admin approves → User can login

2. **Login:**
   - User enters email/password
   - System validates credentials
   - Returns admin/user object
   - Stored in localStorage

3. **Admin Access:**
   - Requires `role: 'admin'` or `'super-admin'`
   - Requires `isApproved: true`
   - Group-specific permissions

4. **Chat Access:**
   - Requires login
   - Requires `isApproved: true`
   - Group-specific rooms

---

## 📦 Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cep_database

# Server
PORT=4000
NODE_ENV=development
HOST=0.0.0.0

# Client
CLIENT_ORIGIN=http://localhost:5173

# Email (Gmail/Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# JWT (if used)
JWT_SECRET=your-secret-key

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

---

## 🎯 Current Super Admin Credentials

- **Email:** `superadmin@cep.com`
- **Username:** `superadmin`
- **Password:** `SuperAdmin@2024`
- **Group:** CEPier
- **Role:** super-admin

---

## 📌 Important Files Reference

### Backend Core
- `server.js` - Main server, Socket.IO setup
- `routes/admin.js` - Admin operations (1425+ lines)
- `routes/auth.js` - Authentication (1187+ lines)
- `routes/choir.js` - Public family endpoints
- `routes/init.js` - Homepage/public endpoints
- `routes/chat.js` - Chat API

### Frontend Core
- `main.tsx` - React entry, routing setup
- `pages/Ishyangaryera Choir/admin/AdminSuperAdmins.tsx` - Super admin management
- `pages/Ishyangaryera Choir/admin/AdminEvents.tsx` - Events management pattern
- `pages/SupportPage.tsx` - Dynamic support page
- `pages/ActivitiesPage.tsx` - Global activities display

### Models
- All user models follow same schema pattern
- Content models (Song, Event, Idea) are group-specific
- Global models for homepage content

---

## 🔄 Data Synchronization

- **Real-time:** Socket.IO for chat
- **REST API:** All other operations
- **Static Files:** Served from `/uploads`
- **Database:** MongoDB with Mongoose ODM

---

## 🎨 UI/UX Patterns

- **Design System:** Tailwind CSS utility classes
- **Icons:** Lucide React (dynamically loaded)
- **Layout:** Responsive grid/flex layouts
- **Modals:** For forms and confirmations
- **Loading States:** Skeleton loaders, spinners
- **Error Handling:** Alert messages, error boundaries

---

## 📈 Scalability Considerations

- **Database:** Separate collections per group (scalable)
- **File Storage:** Local filesystem (consider cloud storage for production)
- **Real-time:** Socket.IO rooms (scales with groups)
- **Caching:** Not implemented (consider Redis for production)
- **CDN:** Not configured (consider for static assets)

---

## 🐛 Known Patterns & Conventions

1. **Group Resolution:** Always check header → query → user's adminGroup
2. **Model Selection:** Use helper functions (`getUserModelForGroup`, etc.)
3. **Error Handling:** Try-catch with console.error + user-friendly messages
4. **File Uploads:** Multer middleware, stored in `/uploads`
5. **Date Handling:** MongoDB Date objects, frontend uses `eventDate` field
6. **Status Fields:** Enums for consistency (status, role, etc.)

---

## ✅ Project Status: Production Ready

The project is well-structured, feature-complete, and ready for deployment with:
- Comprehensive user management
- Multi-group support
- Real-time chat
- Content management
- Admin system
- Public pages
- Security measures

---

**Last Updated:** Based on current codebase analysis  
**Analysis Date:** Current session





