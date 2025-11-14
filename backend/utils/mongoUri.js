const DEFAULT_MONGO_URI = 'mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database';

function getMongoUri() {
  const envUri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== ''
    ? process.env.MONGODB_URI.trim()
    : null;

  if (envUri) {
    return envUri;
  }

  return DEFAULT_MONGO_URI;
}

module.exports = {
  getMongoUri,
  DEFAULT_MONGO_URI,
};


