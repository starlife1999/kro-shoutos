-- KRO ShootOS Supabase schema
-- Run in the Supabase SQL editor before using the app.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shoots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE,
  location TEXT,
  status TEXT DEFAULT 'planning',
  notes TEXT,
  budget_total NUMERIC(10,2) DEFAULT 0,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  shoot_id UUID REFERENCES shoots(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shot_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_board (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
  image_url TEXT,
  color_hex TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  image_url TEXT,
  last_used DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shoot_team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
  team_id UUID REFERENCES team(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_select BOOLEAN DEFAULT FALSE,
  caption TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  actual_cost NUMERIC(10,2) DEFAULT 0,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS color_palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
  colors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pose_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shoot_id UUID REFERENCES shoots(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('mood-board', 'mood-board', true),
  ('outfits', 'outfits', true),
  ('pose-references', 'pose-references', true),
  ('raw-photos', 'raw-photos', true),
  ('locations', 'locations', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE shoots DISABLE ROW LEVEL SECURITY;
ALTER TABLE ideas DISABLE ROW LEVEL SECURITY;
ALTER TABLE shot_list DISABLE ROW LEVEL SECURITY;
ALTER TABLE outfits DISABLE ROW LEVEL SECURITY;
ALTER TABLE mood_board DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE team DISABLE ROW LEVEL SECURITY;
ALTER TABLE shoot_team DISABLE ROW LEVEL SECURITY;
ALTER TABLE raw_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE color_palettes DISABLE ROW LEVEL SECURITY;
ALTER TABLE pose_references DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
