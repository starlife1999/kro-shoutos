-- Migration: Add idea detail tables and storage buckets
-- Run this in the Supabase SQL editor

-- Add notes column to ideas table (safe to run multiple times)
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS notes TEXT;

-- idea_shots table
CREATE TABLE IF NOT EXISTS idea_shots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- idea_outfits table
CREATE TABLE IF NOT EXISTS idea_outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- idea_mood_board table
CREATE TABLE IF NOT EXISTS idea_mood_board (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS on new tables
ALTER TABLE idea_shots DISABLE ROW LEVEL SECURITY;
ALTER TABLE idea_outfits DISABLE ROW LEVEL SECURITY;
ALTER TABLE idea_mood_board DISABLE ROW LEVEL SECURITY;

-- Grant access to anon
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Create storage buckets (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('idea-outfits', 'idea-outfits', true),
  ('idea-mood-board', 'idea-mood-board', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;