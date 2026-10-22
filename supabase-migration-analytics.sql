-- Analytics: Anonymous Pageview Tracking
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  duration_ms INTEGER DEFAULT 0,
  screen_width SMALLINT,
  visitor_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pageviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON pageviews(created_at);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON pageviews(path);
CREATE INDEX IF NOT EXISTS idx_pageviews_visitor_hash ON pageviews(visitor_hash, created_at);
