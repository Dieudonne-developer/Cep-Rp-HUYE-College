// Railway MongoDB connection string (without database name - database specified in connection options)
const DEFAULT_MONGO_URI = 'mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232';
const DEFAULT_DB_NAME = 'cep-app-database';

function getMongoUri() {
  const envUri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== ''
    ? process.env.MONGODB_URI.trim()
    : null;

  if (envUri) {
    // If URI contains database name, remove it (we'll specify it in connection options)
    return envUri.replace(/\/[^\/\?]+(\?|$)/, '$1').replace(/\?$/, '');
  }

  return DEFAULT_MONGO_URI;
}

function getDbName() {
  // Extract database name from MONGODB_URI if present, otherwise use default
  const envUri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== ''
    ? process.env.MONGODB_URI.trim()
    : null;

  if (envUri) {
    // Try to extract database name from URI
    const dbMatch = envUri.match(/\/([^\/\?]+)(\?|$)/);
    if (dbMatch && dbMatch[1] && !dbMatch[1].includes('@')) {
      return dbMatch[1];
    }
  }

  return DEFAULT_DB_NAME;
}

module.exports = {
  getMongoUri,
  getDbName,
  DEFAULT_MONGO_URI,
  DEFAULT_DB_NAME,
};


