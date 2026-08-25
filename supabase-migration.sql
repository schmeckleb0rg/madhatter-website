-- Mad Hatter Comedy Club — Migration SQL
-- Run this in Supabase SQL Editor to apply all updates from the latest feature release.
-- Safe to run on an existing database — uses IF NOT EXISTS and ON CONFLICT DO NOTHING throughout.

-- ============================================
-- 1. ALTER EXISTING TABLES (add new columns)
-- ============================================

-- events: add detailed_description, lineup, comedian_id, ticket_price_cents, ticket_capacity, doors_time, show_time
ALTER TABLE events ADD COLUMN IF NOT EXISTS detailed_description TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS lineup JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS comedian_id UUID;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_price_cents INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_capacity INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS doors_time TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_time TEXT;

-- merch_items: add category, sizes, colors, is_limited, is_archive, inventory_count
ALTER TABLE merch_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'apparel';
ALTER TABLE merch_items ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE merch_items ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE merch_items ADD COLUMN IF NOT EXISTS is_limited BOOLEAN DEFAULT false;
ALTER TABLE merch_items ADD COLUMN IF NOT EXISTS is_archive BOOLEAN DEFAULT false;
ALTER TABLE merch_items ADD COLUMN IF NOT EXISTS inventory_count INTEGER;

-- orders: add Square fields and merch support (remove Stripe if present)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS square_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS merch_item_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'ticket';
-- Safe to run even if stripe columns don't exist (will error silently if already removed)
ALTER TABLE orders DROP COLUMN IF EXISTS stripe_payment_intent_id;
ALTER TABLE orders DROP COLUMN IF EXISTS stripe_session_id;

-- ============================================
-- 2. NEW SITE SETTINGS KEYS
-- ============================================

INSERT INTO site_settings (key, value) VALUES
  ('social_instagram', ''),
  ('social_tiktok', ''),
  ('social_facebook', ''),
  ('social_youtube', ''),
  ('slideshow_speed', '5'),
  ('app_icon_url', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 3. NEW TABLES
-- ============================================

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  capacity INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Public read rooms'
  ) THEN
    CREATE POLICY "Public read rooms" ON rooms FOR SELECT USING (true);
  END IF;
END $$;

-- Default rooms
INSERT INTO rooms (name, slug, description, features, capacity, sort_order) VALUES
  ('Main Stage', 'main-stage', 'The primary event space where the magic happens. Our Main Stage hosts all headline shows, special events, and large-format performances. With premium sound, professional lighting, and tiered seating designed for comedy, every seat in the house delivers an unforgettable experience.', '["Professional sound system", "Stage lighting", "Tiered seating", "Full bar service", "VIP seating available"]'::jsonb, 200, 1),
  ('Green Room', 'green-room', 'The backstage sanctuary where talent gathers before and after shows. Our Green Room is where comedians, performers, and special guests prepare for their sets and unwind after bringing the house down.', '["Private backstage area", "Performer lounge", "Pre-show preparation", "Post-show meet & greet space"]'::jsonb, NULL, 2),
  ('Jazz Room', 'jazz-room', 'A no-reservations, first-come-first-serve piano jazz bar where guests can unwind with live jazz, craft cocktails, and spontaneous vibes. Also offers last-minute walk-in show entry when available.', '["Live piano jazz", "No reservations needed", "Craft cocktail bar", "Walk-in show entry when available", "Intimate atmosphere"]'::jsonb, 50, 3)
ON CONFLICT (slug) DO NOTHING;

-- Private Event Inquiries
CREATE TABLE IF NOT EXISTS private_event_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  event_type TEXT,
  guest_count INTEGER,
  preferred_date TEXT,
  budget_range TEXT,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE private_event_inquiries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'private_event_inquiries' AND policyname = 'Public insert private_event_inquiries'
  ) THEN
    CREATE POLICY "Public insert private_event_inquiries" ON private_event_inquiries FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Subscribers (Mailing List)
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'Public insert subscribers'
  ) THEN
    CREATE POLICY "Public insert subscribers" ON subscribers FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

INSERT INTO email_templates (template_key, subject, body) VALUES
  ('welcome', 'Welcome to Mad Hatter Comedy Club!', 'Thanks for signing up! You''ll be the first to know about upcoming shows, special events, and exclusive offers at Mad Hatter Comedy Club. Stay tuned — the laughs are just getting started.'),
  ('new_event', 'New Show Alert: {{event_title}}', 'A new show has been added to the calendar!

{{event_title}}
Performer: {{event_performer}}
Date: {{event_date}}
Time: {{event_time}}
Price: {{event_price}}

{{event_description}}

Don''t miss out — grab your tickets now!')
ON CONFLICT (template_key) DO NOTHING;

-- Email Queue
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Event Slideshow
CREATE TABLE IF NOT EXISTS event_slideshow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE event_slideshow ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_slideshow' AND policyname = 'Public read event_slideshow'
  ) THEN
    CREATE POLICY "Public read event_slideshow" ON event_slideshow FOR SELECT USING (true);
  END IF;
END $$;

-- Page Content (admin-editable text for all public pages)
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_key, section_key)
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'page_content' AND policyname = 'Public read page_content'
  ) THEN
    CREATE POLICY "Public read page_content" ON page_content FOR SELECT USING (true);
  END IF;
END $$;

-- Default page content
INSERT INTO page_content (page_key, section_key, content) VALUES
  ('events', 'subtitle', 'What''s On'),
  ('events', 'title_line1', 'Upcoming'),
  ('events', 'title_line2', 'Shows'),
  ('events', 'badge', 'Live Comedy'),
  ('comedians', 'subtitle', 'The Lineup'),
  ('comedians', 'title_line1', 'Our'),
  ('comedians', 'title_line2', 'Comedians'),
  ('comedians', 'badge', 'The Talent'),
  ('merch', 'subtitle', 'Rep the Club'),
  ('merch', 'title_line1', 'Official'),
  ('merch', 'title_line2', 'Merch'),
  ('merch', 'badge', 'Gear Up'),
  ('merch', 'description', 'Official Mad Hatter gear. Available at the venue and online soon.'),
  ('about', 'subtitle', 'Our Story'),
  ('about', 'badge', 'Est. 2026'),
  ('rooms', 'subtitle', 'Our Spaces'),
  ('rooms', 'title_line1', 'The'),
  ('rooms', 'title_line2', 'Rooms'),
  ('rooms', 'badge', 'Explore'),
  ('contact', 'subtitle', 'Get In Touch'),
  ('contact', 'description', 'Questions about shows, private events, or just want to say hello? We''d love to hear from you.')
ON CONFLICT (page_key, section_key) DO NOTHING;
