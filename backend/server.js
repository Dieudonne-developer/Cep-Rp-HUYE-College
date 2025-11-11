/* eslint-disable no-console */
require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const { Server } = require('socket.io');

// Import organized modules
const corsOptions = require('./middleware/cors');
const helmetOptions = require('./middleware/security');
const upload = require('./middleware/upload');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const choirRoutes = require('./routes/choir');
const homeRoutes = require('./routes/init');
const chatRoutes = require('./routes/chat');

// Import models
const UserRegistration = require('./models/UserRegistration');
const CepierUser = require('./models/CepierUser');
const AnointedUser = require('./models/AnointedUser');
const AbanyamugishaUser = require('./models/AbanyamugishaUser');
const Psalm23User = require('./models/Psalm23User');
const Psalm46User = require('./models/Psalm46User');
const ProtocolUser = require('./models/ProtocolUser');
const SocialUser = require('./models/SocialUser');
const EvangelicalUser = require('./models/EvangelicalUser');
const Song = require('./models/Song');
const Event = require('./models/Event');
const ChatMessage = require('./models/ChatMessage');
const Asset = require('./models/Asset');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors(corsOptions));
app.use(helmet(helmetOptions));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Initialize Socket.IO with CORS matching main middleware
const socketIoAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4000',
  'http://172.16.12.113:5173',
  'http://10.11.217.11:5173',
  'http://10.11.217.18:5173',
  'http://10.11.217.18:4000',
  'http://10.11.217.46:5173',
  'http://10.11.217.77:5173',
  'http://10.11.217.130:5173',
  'http://10.11.217.158:5173',
  'http://172.25.192.1:5173',
  'http://172.25.192.1:4000',
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check exact match
      if (socketIoAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow local network IPs
      if (origin.match(/^http:\/\/192\.168\.\d+\.\d+:5173$/) ||
          origin.match(/^http:\/\/172\.\d+\.\d+\.\d+:5173$/) ||
          origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:5173$/) ||
          // Allow Render static sites and web services
          origin.match(/^https:\/\/.*\.onrender\.com$/) ||
          origin.match(/^https:\/\/.*\.render\.com$/)) {
        return callback(null, true);
      }
      
      // Reject other origins
      callback(new Error('Not allowed by Socket.IO CORS'));
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cep_database')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.error('⚠️  Server will continue without MongoDB connection. Some features may not work.');
    // Don't exit - allow server to start even if MongoDB fails
    // process.exit(1);
  });

// Socket.IO connection handling
// Track connected users by username and group
const connectedUsers = new Map(); // Map<username, {socketId, username, group, joinedAt}>
const groupRooms = new Map(); // Map<group, Set<username>>

// Helper function to get user model by group
async function getUserByUsername(username, group) {
  if (group === 'admins') {
    const adminModels = [
      UserRegistration,
      CepierUser,
      AnointedUser,
      AbanyamugishaUser,
      Psalm23User,
      Psalm46User,
      ProtocolUser,
      SocialUser,
      EvangelicalUser
    ];

    for (const Model of adminModels) {
      const found = await Model.findOne({ username }).select('profileImage username').lean();
      if (found) return found;
    }
    return null;
  }

  const groupModelMap = {
    'choir': UserRegistration,
    'cepier': UserRegistration,
    'anointed': AnointedUser,
    'abanyamugisha': AbanyamugishaUser,
    'psalm23': Psalm23User,
    'psalm46': Psalm46User,
    'protocol': ProtocolUser,
    'social': SocialUser,
    'evangelical': EvangelicalUser
  };
  
  const UserModel = groupModelMap[group] || UserRegistration;
  return await UserModel.findOne({ username }).select('profileImage username').lean();
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('set-username', async (data) => {
    const { username, group } = data;
    const userGroup = (group || 'choir').toLowerCase();
    
    // Validate group
    const validGroups = ['choir', 'cepier', 'admins', 'anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical'];
    if (!validGroups.includes(userGroup)) {
      socket.emit('error', { message: 'Invalid group specified' });
      return;
    }
    
    socket.userName = username;
    socket.userGroup = userGroup;
    const roomName = `${userGroup}-chat`;
    
    // Join the group room
    socket.join(roomName);
    
    console.log(`User ${socket.id} (${username}) joined group: ${userGroup}, room: ${roomName}`);
    
    // Track this user as online
    connectedUsers.set(username, {
      socketId: socket.id,
      username: username,
      group: userGroup,
      joinedAt: new Date()
    });
    
    // Track users in this group room
    if (!groupRooms.has(userGroup)) {
      groupRooms.set(userGroup, new Set());
    }
    groupRooms.get(userGroup).add(username);
    
    // Notify others in the room
    socket.to(roomName).emit('user-joined', { 
      user: username,
      message: `${username} joined the chat`
    });
    
    // Fetch and send online users for this group only
    try {
      const groupUsers = Array.from(groupRooms.get(userGroup))
        .filter(u => connectedUsers.has(u))
        .map(u => connectedUsers.get(u));
      
      const usersWithProfileImages = await Promise.all(
        groupUsers.map(async (u) => {
          const userDoc = await getUserByUsername(u.username, u.group);
          return {
            name: u.username,
            isOnline: true,
            avatar: userDoc?.profileImage || null
          };
        })
      );
      
      // Send to all users in this group room
      io.to(roomName).emit('online-users-updated', usersWithProfileImages);
    } catch (error) {
      console.error('Error fetching user profile images:', error);
      const groupUsers = Array.from(groupRooms.get(userGroup) || [])
        .filter(u => connectedUsers.has(u))
        .map(u => ({
          name: u,
          isOnline: true
        }));
      io.to(roomName).emit('online-users-updated', groupUsers);
    }
  });
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    
    // Notify others in the room
    socket.to(room).emit('user-joined', { 
      user: socket.userName || 'Anonymous',
      message: `${socket.userName || 'Anonymous'} joined the chat`
    });
  });

  socket.on('send-message', async (data) => {
    try {
      console.log('Message received:', data);
      
      const userGroup = (data.group || socket.userGroup || 'choir').toLowerCase();
      const roomName = `${userGroup}-chat`;
      
      // Validate group
      const validGroups = ['choir', 'cepier', 'admins', 'anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical'];
      if (!validGroups.includes(userGroup)) {
        socket.emit('message-error', { error: 'Invalid group specified' });
        return;
      }
      
      // Save message to database with group
      const message = new ChatMessage({
        user: data.user,
        message: data.message,
        type: data.type || 'user',
        avatar: data.avatar,
        group: userGroup,
        timestamp: new Date(),
        voiceNote: data.voiceNote,
        fileAttachment: data.fileAttachment
      });
      
      await message.save();
      
      // Broadcast to all users in the group room only
      io.to(roomName).emit('receive-message', {
        ...data,
        id: message._id,
        timestamp: message.timestamp,
        group: userGroup
      });
      
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message-error', { error: 'Failed to save message' });
    }
  });
  
  socket.on('user-typing', (data) => {
    const userGroup = (data.group || socket.userGroup || 'choir').toLowerCase();
    const roomName = `${userGroup}-chat`;
    
    socket.to(roomName).emit('user-typing', {
      user: data.user,
      isTyping: data.isTyping
    });
  });
  
  socket.on('user-stop-typing', (data) => {
    const userGroup = (data.group || socket.userGroup || 'choir').toLowerCase();
    const roomName = `${userGroup}-chat`;
    
    socket.to(roomName).emit('user-stop-typing', {
      user: data.user
    });
  });
  
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    // Notify others if user had a username
    if (socket.userName && socket.userGroup) {
      const roomName = `${socket.userGroup}-chat`;
      
      // Remove from online users
      connectedUsers.delete(socket.userName);
      
      // Remove from group room
      if (groupRooms.has(socket.userGroup)) {
        groupRooms.get(socket.userGroup).delete(socket.userName);
      }
      
      // Fetch and send updated online users for this group only
      try {
        const groupUsers = Array.from(groupRooms.get(socket.userGroup) || [])
          .filter(u => connectedUsers.has(u))
          .map(u => connectedUsers.get(u));
        
        const usersWithProfileImages = await Promise.all(
          groupUsers.map(async (u) => {
            const userDoc = await getUserByUsername(u.username, u.group);
            return {
              name: u.username,
              isOnline: true,
              avatar: userDoc?.profileImage || null
            };
          })
        );
        
        // Send to all users in this group room
        io.to(roomName).emit('online-users-updated', usersWithProfileImages);
      } catch (error) {
        console.error('Error fetching user profile images:', error);
        const groupUsers = Array.from(groupRooms.get(socket.userGroup) || [])
          .filter(u => connectedUsers.has(u))
          .map(u => ({
            name: u,
            isOnline: true
          }));
        io.to(roomName).emit('online-users-updated', groupUsers);
      }
      
      // Notify others in the room
      socket.to(roomName).emit('user-left', { 
        user: socket.userName,
        message: `${socket.userName} left the chat`
      });
    }
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'CEP Backend Server is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working',
    timestamp: new Date().toISOString()
  });
});

// Favicon route
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/choir', choirRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/home', homeRoutes);

// Assets: logo image from DB with filesystem fallback
app.get('/api/assets/logo', async (req, res) => {
  try {
    // Try DB first
    const asset = await Asset.findOne({ key: 'logo' }).lean();
    if (asset?.data) {
      const buffer = Buffer.from(asset.data, 'base64');
      res.setHeader('Content-Type', asset.mimeType || 'image/jpeg');
      return res.status(200).send(buffer);
    }
    // Fallback to project-root log.jpg if present
    const rootLogoPath = path.join(__dirname, '..', 'log.jpg');
    if (fs.existsSync(rootLogoPath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      return fs.createReadStream(rootLogoPath).pipe(res);
    }
    return res.status(404).json({ success: false, message: 'Logo not found' });
  } catch (err) {
    console.error('Error serving logo:', err);
    return res.status(500).json({ success: false, message: 'Failed to load logo' });
  }
});

// Optional: upsert logo via base64 (for admins/tools). Expects { data, mimeType }
app.post('/api/assets/logo', async (req, res) => {
  try {
    const { data, mimeType } = req.body || {};
    if (!data) {
      return res.status(400).json({ success: false, message: 'data (base64) is required' });
    }
    const updated = await Asset.findOneAndUpdate(
      { key: 'logo' },
      { data, mimeType: mimeType || 'image/jpeg' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, id: updated._id });
  } catch (err) {
    console.error('Error saving logo:', err);
    return res.status(500).json({ success: false, message: 'Failed to save logo' });
  }
});

// Legacy routes for backward compatibility
app.get('/api/home', (req, res) => {
    res.json({
      success: true,
    message: 'Welcome to CEP Home',
    data: {
      title: 'CEP Huye College',
      description: 'Welcome to our vibrant community platform! CEP-RP Huye College is a place where faith, fellowship, and service come together. We are committed to building a strong community through worship, education, and outreach. Join us as we grow together in faith and make a positive impact in our community and beyond.'
    }
  });
});

app.get('/api/families', (req, res) => {
    res.json({
      success: true,
    message: 'Families data',
    data: [
      { 
        id: 1, 
        name: 'Ishyanga Ryera Choir', 
        description: 'But you are a chosen people, a royal priesthood, a holy nation, God\'s own possession, that you may declare the praises of Him who called you out of darkness into His wonderful light — 1 Peter 2:9',
        link: '/choir'
      },
      { 
        id: 2, 
        name: 'Anointed worship team', 
        description: 'I will glory in the Lord; let the afflicted hear and rejoice.',
        link: '/anointed'
      },
      { 
        id: 3, 
        name: 'Abanyamugisha family', 
        description: 'And when you pray, do not be like the hypocrites, for they love to pray standing in the synagogues and on the street corners to be seen by others. Truly I tell you, they have received their reward in full.',
        link: '/abanyamugisha'
      },
      { 
        id: 4, 
        name: 'Psalm 23 family', 
        description: 'The Lord is my Shepherd; I shall not want.',
        link: '/psalm23'
      },
      { 
        id: 5, 
        name: 'Psalm 46 family', 
        description: 'God is our refuge and strength, an ever-present help in trouble.',
        link: '/psalm46'
      },
      { 
        id: 6, 
        name: 'Protocol family', 
        description: 'Committed to serving our local community and supporting missions worldwide, spreading God\'s love through practical acts of service.',
        link: '/protocol'
      },
      { 
        id: 7, 
        name: 'Social family', 
        description: 'Fellowship and care focused family strengthening bonds and community support.',
        link: '/social'
      },
      { 
        id: 8, 
        name: 'Evangelical family', 
        description: 'Passionate about outreach and sharing the Gospel through word and action.',
        link: '/evangelical'
      }
    ]
  });
});

// Debug endpoints
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await UserRegistration.find().select('email username isVerified verificationToken createdAt');
    res.json({ 
      success: true, 
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Manual verification endpoint (for when email fails)
app.get('/api/manual-verify/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Manual verification request for email:', email);
    
    const user = await UserRegistration.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false, 
        message: 'User not found with this email address'
      });
    }
    
    if (user.isVerified) {
      return res.json({
        success: true,
        message: 'User is already verified',
        user: {
          email: user.email,
          username: user.username,
          isVerified: user.isVerified
        }
      });
    }
    
    const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify?token=${user.verificationToken}`;
    
    res.json({ 
      success: true, 
      message: 'User found. Use this verification link:',
      verificationLink: verificationLink,
      token: user.verificationToken,
      user: {
        email: user.email,
        username: user.username,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Manual verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process manual verification',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🌐 Accessible from network at: http://${HOST === '0.0.0.0' ? '10.11.217.18' : HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});