const cors = require('cors');

// CORS configuration
const allowedOrigins = [
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
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL
].filter(Boolean);

// Enable CORS logging in production for debugging (can be disabled later)
const shouldLog = (process.env.DEBUG_CORS === 'true') || (process.env.NODE_ENV !== 'production') || true;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (shouldLog) console.log(`CORS request from origin: ${origin}`);
    if (allowedOrigins.includes(origin) ||
        origin.match(/^http:\/\/192\.168\.\d+\.\d+:5173$/) ||
        origin.match(/^http:\/\/172\.\d+\.\d+\.\d+:5173$/) ||
        origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:5173$/) ||
        // Allow Render static sites and web services
        origin.match(/^https:\/\/.*\.onrender\.com$/) ||
        origin.match(/^https:\/\/.*\.render\.com$/)) {
      if (shouldLog) console.log(`CORS allowed for origin: ${origin}`);
      return callback(null, true);
    }
    if (shouldLog) console.log(`CORS blocked for origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

module.exports = corsOptions;


