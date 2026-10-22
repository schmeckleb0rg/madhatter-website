-- Phase 6 Migration: Password Reset, Event Schema Expansion, Promo Codes
-- Run this against your Supabase database

-- ============================================================
-- 1. Password Reset Tokens
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- No public access — only service role can read/write

-- ============================================================
-- 2. Event Schema Additions
-- ============================================================

DO $$ BEGIN ALTER TABLE events ADD COLUMN timezone TEXT DEFAULT 'America/Chicago'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE events ADD COLUMN end_time TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE events ADD COLUMN custom_time_slots JSONB DEFAULT '[]'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE events ADD COLUMN ticket_tiers JSONB DEFAULT '[]'; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE events ADD COLUMN slug TEXT UNIQUE; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE events ADD COLUMN is_rsvp BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug) WHERE slug IS NOT NULL;

-- ============================================================
-- 3. Promo Codes
-- ============================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('dollars_off', 'percent_off', 'early_access')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  is_site_wide BOOLEAN DEFAULT false,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  min_purchase_cents INTEGER,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active promo_codes" ON promo_codes;
CREATE POLICY "Public can read active promo_codes" ON promo_codes
  FOR SELECT USING (is_active = true);
