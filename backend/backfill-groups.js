const { query } = require('./src/db/pool');
const { withDatabase } = require('./src/db/script');

withDatabase(async () => {
  const users = await query(
    `UPDATE app_users SET admin_group = user_group WHERE admin_group IS NULL OR admin_group = ''`
  );
  console.log(`✅ Backfilled admin_group on ${users.rowCount} users`);
});
