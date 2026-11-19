require('../src/env');
const { query, pool } = require('../src/db/pool');

(async () => {
  const del = await query(
    'DELETE FROM whatsapp_access_requests WHERE lower(user_email) = $1',
    ['superadmin@cep.com']
  );
  await query(
    "UPDATE whatsapp_groups SET description = $1 WHERE slug = 'choir'",
    ['Choir family WhatsApp group.']
  );
  const groups = await query(
    'SELECT slug, (invite_url IS NOT NULL) AS has_link FROM whatsapp_groups ORDER BY slug'
  );
  console.log('removed', del.rowCount);
  console.log(groups.rows.map((row) => `${row.slug}:${row.has_link ? 'link' : 'empty'}`).join(', '));
  await pool.end();
})().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
