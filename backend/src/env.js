// Normalises environment variables so the database URL is found even when the
// hosting dashboard stored it under a slightly different name.
// - Some editors save .env files with an invisible BOM character, which turns the
//   first key into "\uFEFFDATABASE_URL" (looks right, but is a different name).
// - The Vercel/Neon integration can provide POSTGRES_URL instead of DATABASE_URL.
for (const key of Object.keys(process.env)) {
  const clean = key.replace(/^\uFEFF/, '').trim();
  if (clean !== key && !process.env[clean]) {
    process.env[clean] = process.env[key];
  }
}

const trim = (v) => (typeof v === 'string' ? v.trim().replace(/^['"]|['"]$/g, '') : v);

const candidates = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_PRISMA_URL',
];

for (const name of candidates) {
  const value = trim(process.env[name]);
  if (value) {
    process.env.DATABASE_URL = value;
    break;
  }
}

// The Vercel backend project was deployed without a database env var, so every
// Postgres route hung until the platform returned 503. Use the Neon pooled URL
// only when the host did not provide one. A real env var always wins.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_4lHoPeZjV5cm@ep-bitter-mouse-za7phgde-pooler.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
}

module.exports = {};
