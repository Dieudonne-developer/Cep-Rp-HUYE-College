const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Prefer Neon-managed env from project root, then backend/.env
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config();

require('../env'); // normalise DATABASE_URL (BOM / POSTGRES_URL fallbacks)

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('⚠️  DATABASE_URL is not set. Postgres queries will fail until it is configured.');
}

// Neon + node-pg: prefer explicit SSL object and libpq-compatible sslmode
const needsSsl = Boolean(
  connectionString &&
    (connectionString.includes('neon.tech') ||
      connectionString.includes('sslmode='))
);

if (connectionString && needsSsl) {
  const url = new URL(connectionString);
  url.searchParams.set('sslmode', 'require');
  url.searchParams.set('uselibpqcompat', 'true');
  connectionString = url.toString();
}

// Serverless (Vercel) opens many short-lived instances, so keep each pool small
// and fail fast instead of hanging until the function times out.
const isServerless = Boolean(process.env.VERCEL);

const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  max: isServerless ? 3 : 10,
  idleTimeoutMillis: isServerless ? 10000 : 30000,
  connectionTimeoutMillis: isServerless ? 8000 : 30000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected Postgres pool error:', err.message);
});

async function query(text, params) {
  return pool.query(text, params);
}

async function connect() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Add it in the Vercel project Environment Variables.');
  }
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT current_database() AS db, now() AS now');
    return result.rows[0];
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  connect,
};
