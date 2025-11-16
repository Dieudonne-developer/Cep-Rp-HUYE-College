# CEP Huye College App

A modern web application for CEP Huye College with Node.js backend, React frontend, and MongoDB database.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
```

**Database Seeding:**
```bash
npm run seed
```

**Start Backend:**
```bash
npm run dev
# or
npm start
```

Backend runs on: `http://localhost:4000`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

**Start Frontend:**
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. Mobile App (React Native + Expo)

```bash
cd "Mobile app of Cep app"
npm install
npm run start   # starts Expo dev server
# or
npm run android
npm run ios
npm run web
```

- Uses the same production backend at `https://cep-backend-hjfu.onrender.com`
- Update `EXPO_PUBLIC_API_BASE_URL` if you need to point to a different backend
- Login with the same admin credentials listed in `ADMIN_CREDENTIALS.md`

## 🌐 Network Access

The frontend is configured to accept network connections. When you run `npm run dev`, you'll see:

```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

Use the Network URL to access the app from other devices on the same network.

## 📊 Database Seeding

The `npm run seed` command populates the database with:

- **Families**: 8 family groups including Ishyanga Ryera Choir
- **Activities**: Sample CEP activities
- **Choir Media**: Videos, photos, and audio files
- **Choir Songs**: 5 sample songs
- **Choir Activities**: Upcoming, regular, and past events
- **Choir Ideas**: Implemented suggestions
- **Users**: Sample admin and regular users

## 🏗️ Project Structure

```
cep-app/
├── backend/
│   ├── server.js          # Main server file
│   ├── seed.js            # Database seeding script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── FamiliesPage.tsx
│   │   │   └── Ishyangaryera Choir/
│   │   │       └── ChoirPage.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## 🔗 API Endpoints

### Main App
- `GET /api/health` - Health check
- `GET /api/home` - Home page content
- `GET /api/families` - List all families
- `GET /api/activities` - CEP activities
- `POST /api/activities` - Create activity

### Choir Specific
- `GET /api/choir/media` - Choir videos, photos, songs
- `GET /api/choir/activities` - Choir events
- `GET /api/choir/implemented-ideas` - Implemented suggestions
- `POST /api/choir/ideas` - Submit new idea
- `POST /api/choir/support/verify` - Payment verification

## 🎵 Choir Features

The Ishyanga Ryera Choir section includes:

- **About**: History, leadership, quick facts
- **Media**: Videos, songs, photo gallery
- **Activities**: Upcoming events, regular schedule, past activities
- **Ideas**: Submit suggestions, view implemented ideas
- **Support**: Financial support options, online donations

## 🌍 Environment Variables

Create `.env` file in backend directory:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cep_app
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

## 📱 Mobile Access

To access from mobile devices on the same network:

1. Find your computer's IP address
2. Use the Network URL shown when running `npm run dev`
3. Example: `http://192.168.1.100:5173`

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-restart on changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### Database Reset
```bash
cd backend
npm run seed  # Clears and reseeds database
```

## 📦 Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

## 🚀 Deployment

### Backend Deployment (Railway)

The backend is configured for deployment on Railway. Railway offers better SMTP support and more flexible deployment options.

**Quick Setup:**
1. See `RAILWAY_DEPLOYMENT.md` for complete guide
2. Or use `backend/RAILWAY_ENV_VARIABLES.txt` for environment variables
3. See `backend/RAILWAY_ENV_SETUP.md` for detailed instructions

**Railway Advantages:**
- ✅ No SMTP blocking (email works out of the box)
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Seamless MongoDB integration (Railway MongoDB plugin)

### Frontend Deployment (Vercel)

The frontend is deployed on Vercel at `https://cep-rp-huye-college.vercel.app`

**Setup:**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel Dashboard:
   - `VITE_API_BASE_URL`: Your Railway backend URL
3. Deploy automatically on push to main branch

### Database (Railway MongoDB)

The database is hosted on Railway MongoDB plugin:
- Connection: `mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database`
- Database Name: `cep-app-database`

**Note**: After deploying backend on Railway, update `VITE_API_BASE_URL` in Vercel to point to your Railway backend URL.

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database permissions

### Network Access Issues
- Check firewall settings
- Ensure devices are on same network
- Try different port if 5173 is blocked

### CORS Issues
- Update `CLIENT_ORIGIN` in backend `.env`
- Include network IP in CORS origins

## 📞 Support

For issues or questions:
- Check the console for error messages
- Verify all dependencies are installed
- Ensure MongoDB is accessible
- Check network connectivity

## 🎯 Features

- ✅ Modern React SPA with TypeScript
- ✅ Node.js Express API
- ✅ MongoDB with Mongoose
- ✅ Responsive design with Tailwind CSS
- ✅ Real-time features with Socket.IO
- ✅ Network access for mobile testing
- ✅ Database seeding for development
- ✅ Choir management system
- ✅ Family organization structure






