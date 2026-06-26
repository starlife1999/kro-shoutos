-- Shot References table and storage bucket
-- Run this in Supabase SQL editor before using the Shot Detail page.

CREATE TABLE IF NOT EXISTS shot_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shot_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  shot_type TEXT NOT NULL CHECK (shot_type IN ('shoot', 'idea')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No foreign keys since shot_id can reference either shot_list or idea_shots

INSERT INTO storage.buckets (id, name, public)
VALUES ('shot-references', 'shot-references', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

ALTER TABLE shot_references DISABLE ROW LEVEL SECURITY;

GRANT ALL ON shot_references TO anon;