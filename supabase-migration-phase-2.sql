-- Phase 2: Event Genres & Discovery
-- Run AFTER phase-1 migration

-- Genre table
CREATE TABLE IF NOT EXISTS event_genres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#B8934A',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table for many-to-many event-genre relationship
CREATE TABLE IF NOT EXISTS event_genre_assignments (
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES event_genres(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, genre_id)
);

-- RLS
ALTER TABLE event_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_genre_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_genres') THEN
    CREATE POLICY public_read_genres ON event_genres FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_all_genres') THEN
    CREATE POLICY admin_all_genres ON event_genres FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_genre_assignments') THEN
    CREATE POLICY public_read_genre_assignments ON event_genre_assignments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_all_genre_assignments') THEN
    CREATE POLICY admin_all_genre_assignments ON event_genre_assignments FOR ALL USING (true);
  END IF;
END $$;

-- Seed default genres
INSERT INTO event_genres (name, color) VALUES
  ('Stand-Up', '#B8934A'),
  ('Improv', '#2F6E52'),
  ('Sketch', '#4A6FA5'),
  ('Open Mic', '#7B5EA7'),
  ('Showcase', '#C4783A'),
  ('Special Event', '#8B4513'),
  ('Workshop', '#6B8E23')
ON CONFLICT (name) DO NOTHING;

-- Event series table (for Phase 5.3)
CREATE TABLE IF NOT EXISTS event_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE event_series ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_event_series') THEN
    CREATE POLICY public_read_event_series ON event_series FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_all_event_series') THEN
    CREATE POLICY admin_all_event_series ON event_series FOR ALL USING (true);
  END IF;
END $$;

-- Add event_series_id to events if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_series_id') THEN
    ALTER TABLE events ADD COLUMN event_series_id UUID REFERENCES event_series(id) ON DELETE SET NULL;
  END IF;
END $$;
