-- Phase 5: Event Series + missing column additions
-- Run after phase-4b migration

-- Event Series table
CREATE TABLE IF NOT EXISTS event_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add event_series_id to events if not exists
DO $$ BEGIN
  ALTER TABLE events ADD COLUMN event_series_id UUID REFERENCES event_series(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add virtual_tour_images to rooms if not exists
DO $$ BEGIN
  ALTER TABLE rooms ADD COLUMN virtual_tour_images JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add room_id and tags to gallery_images if not exists
DO $$ BEGIN
  ALTER TABLE gallery_images ADD COLUMN room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE gallery_images ADD COLUMN tags JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- RLS policies for event_series
ALTER TABLE event_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read event_series" ON event_series;
CREATE POLICY "Public can read event_series" ON event_series
  FOR SELECT USING (true);
