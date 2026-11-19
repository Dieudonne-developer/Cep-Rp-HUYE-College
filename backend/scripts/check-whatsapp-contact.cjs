require('../src/env');
const { query, pool } = require('../src/db/pool');

const phone = '0788111222';

async function call(body) {
  const res = await fetch('http://localhost:4000/api/whatsapp/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { status: res.status, message: data.message, hasLink: Boolean(data.inviteUrl && String(data.inviteUrl).startsWith('https://chat.whatsapp.com/')) };
}

(async () => {
  const user = await query(
    "SELECT id, user_group FROM app_users WHERE lower(email) = $1 AND is_approved = TRUE LIMIT 1",
    ['superadmin@cep.com']
  );
  if (!user.rows[0]) throw new Error('approved test member missing');
  await query('UPDATE app_users SET contact_number = $1 WHERE id = $2', [phone, user.rows[0].id]);
  const group = user.rows[0].user_group;
  const pub = await fetch('http://localhost:4000/api/whatsapp/groups').then((r) => r.json());
  const leak = JSON.stringify(pub).includes('chat.whatsapp.com');
  const cep = await call({ slug: 'cep', contactNumber: phone });
  const own = await call({ slug: group, contactNumber: '+250' + phone.slice(1) });
  const other = await call({ slug: group === 'anointed' ? 'choir' : 'anointed', contactNumber: phone });
  const stranger = await call({ slug: 'cep', contactNumber: '0788000000' });
  const short = await call({ slug: 'cep', contactNumber: '123' });
  await query('UPDATE app_users SET contact_number = NULL WHERE id = $1', [user.rows[0].id]);
  console.log(JSON.stringify({ group, leak, cep, own, other, stranger, short }, null, 2));
  await pool.end();
})().catch(async (error) => {
  console.error(error);
  try { await pool.end(); } catch { /* ignore */ }
  process.exit(1);
});
