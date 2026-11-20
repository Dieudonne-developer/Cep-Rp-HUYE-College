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
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS contact_number TEXT;

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

CREATE TABLE IF NOT EXISTS whatsapp_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  invite_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES whatsapp_groups(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  username TEXT,
  user_group TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, user_email)
);

INSERT INTO whatsapp_groups (slug, name, description, invite_url, is_active)
VALUES
  ('cep', 'CEP Group', 'Main CEP community WhatsApp group.', 'https://chat.whatsapp.com/KshHGDS0KdVL7RFhe7wOUi', TRUE),
  ('anointed', 'The Anointed Group', 'Anointed worship team WhatsApp group.', 'https://chat.whatsapp.com/JfnnXpYnWN51i4thUGshw4', TRUE),
  ('protocol', 'Protocol Family', 'Protocol family WhatsApp group.', 'https://chat.whatsapp.com/KIUahpUhQ4A0gRVLk7edYY', TRUE),
  ('choir', 'Ishyanga Ryera Choir', 'Choir family WhatsApp group.', NULL, TRUE),
  ('abanyamugisha', 'Abanyamugisha Family', 'Abanyamugisha family WhatsApp group.', NULL, TRUE),
  ('psalm23', 'Psalm 23 Family', 'Psalm 23 family WhatsApp group.', NULL, TRUE),
  ('psalm46', 'Psalm 46 Family', 'Psalm 46 family WhatsApp group.', NULL, TRUE),
  ('social', 'Social Family', 'Social family WhatsApp group.', NULL, TRUE),
  ('evangelical', 'Evangelical Family', 'Evangelical family WhatsApp group.', NULL, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  invite_url = COALESCE(whatsapp_groups.invite_url, EXCLUDED.invite_url),
  description = CASE
    WHEN whatsapp_groups.invite_url IS NULL AND EXCLUDED.invite_url IS NOT NULL
    THEN EXCLUDED.description
    ELSE whatsapp_groups.description
  END;

DELETE FROM whatsapp_groups WHERE slug = 'cepier';
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
