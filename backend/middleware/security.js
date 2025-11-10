const helmet = require('helmet');

// Security middleware configuration
const helmetOptions = {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "data:", "blob:", "http:", "https:"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
    },
  },
};

module.exports = helmetOptions;



