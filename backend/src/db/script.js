const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();

const { connect, pool } = require('./pool');
const { migrate } = require('./migrate');

async function withDatabase(work) {
  try {
    const info = await connect();
    await migrate();
    console.log(`✅ Connected to Neon Postgres (${info.db})`);
    await work();
  } catch (error) {
    console.error('❌ Database script failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

module.exports = { withDatabase };
