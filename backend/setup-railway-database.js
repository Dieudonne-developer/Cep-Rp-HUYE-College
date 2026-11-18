const { withDatabase } = require('./src/db/script');

withDatabase(async () => {
  console.log('✅ Neon Postgres schema is ready. Railway Mongo setup is no longer used.');
});
