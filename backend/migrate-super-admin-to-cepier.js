const { withDatabase } = require('./src/db/script');
const { query } = require('./src/db/pool');

withDatabase(async () => {
  const result = await query(
    `UPDATE app_users
     SET user_group = 'cepier', admin_group = 'cepier', role = 'super-admin'
     WHERE role = 'super-admin' AND user_group <> 'cepier'`
  );
  console.log(`✅ Super-admin rows moved to cepier: ${result.rowCount}`);
});
