const { withDatabase } = require('./src/db/script');
const { query } = require('./src/db/pool');

withDatabase(async () => {
  const tables = await query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log('Public tables:');
  for (const row of tables.rows) console.log(' -', row.table_name);
});
