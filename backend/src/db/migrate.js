const { pool, query } = require('./pool');

const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  profile_image TEXT,
  role TEXT DEFAULT 'viewer',
  admin_group TEXT,
  user_group TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  UNIQUE (user_group, email),
  UNIQUE (user_group, username)
);

CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group" TEXT NOT NULL,
  owner_admin_id TEXT,
  owner_admin_email TEXT,
  title TEXT NOT NULL,
  artist TEXT,
  description TEXT,
  file_url TEXT,
  url TEXT,
  thumbnail_url TEXT,
  thumbnail TEXT,
  media_type TEXT DEFAULT 'audio',
  duration TEXT,
  downloadable BOOLEAN DEFAULT FALSE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group" TEXT NOT NULL,
  owner_admin_id TEXT,
  owner_admin_email TEXT,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ,
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS implemented_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group" TEXT NOT NULL,
  owner_admin_id TEXT,
  owner_admin_email TEXT,
  idea TEXT NOT NULL,
  category TEXT,
  name TEXT,
  email TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  implemented_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user" TEXT NOT NULL,
  message TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT DEFAULT 'user',
  avatar TEXT,
  status TEXT DEFAULT 'sent',
  "group" TEXT NOT NULL DEFAULT 'choir',
  voice_note JSONB,
  file_attachment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  mime_type TEXT DEFAULT 'image/jpeg',
  data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS global_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ,
  event_time TEXT,
  location TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming',
  owner_admin_id TEXT,
  owner_admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS global_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea TEXT NOT NULL,
  category TEXT,
  name TEXT,
  email TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  implementation_details TEXT,
  implemented_date TIMESTAMPTZ,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  owner_admin_id TEXT,
  owner_admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS global_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank JSONB DEFAULT '{}'::jsonb,
  mobile_money JSONB DEFAULT '{}'::jsonb,
  online_donation_note TEXT DEFAULT 'Paystack verification pending server integration.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_support (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group" TEXT NOT NULL UNIQUE,
  bank JSONB DEFAULT '{}'::jsonb,
  mobile_money JSONB DEFAULT '{}'::jsonb,
  online_donation_note TEXT DEFAULT 'Paystack verification pending server integration.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users (email);
CREATE INDEX IF NOT EXISTS idx_app_users_token ON app_users (verification_token);
CREATE INDEX IF NOT EXISTS idx_songs_group ON songs ("group");
CREATE INDEX IF NOT EXISTS idx_events_group ON events ("group");
CREATE INDEX IF NOT EXISTS idx_ideas_group ON implemented_ideas ("group");

ALTER TABLE implemented_ideas ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE implemented_ideas ADD COLUMN IF NOT EXISTS implementation_details TEXT;
ALTER TABLE implemented_ideas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE implemented_ideas ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE implemented_ideas ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_chat_group ON chat_messages ("group");
`;

async function migrate() {
  await query(SCHEMA_SQL);
  console.log('✅ Postgres schema ready');
}

if (require.main === module) {
  migrate()
    .then(() => pool.end())
    .catch(async (err) => {
      console.error('❌ Migration failed:', err);
      await pool.end();
      process.exit(1);
    });
}

module.exports = { migrate, SCHEMA_SQL };
