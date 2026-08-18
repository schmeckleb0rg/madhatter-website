-- Mad Hatter Comedy Club — Supabase Schema
-- Run this in the Supabase SQL editor

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  performer TEXT,
  date TIMESTAMPTZ NOT NULL,
  doors_time TEXT,
  show_time TEXT,
  image_url TEXT,
  ticket_price TEXT,
  is_sold_out BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS past_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  performer TEXT,
  date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  party_size INTEGER DEFAULT 1,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Public can read upcoming events
CREATE POLICY "Public read events" ON events
  FOR SELECT USING (true);

-- Public can read past events
CREATE POLICY "Public read past_events" ON past_events
  FOR SELECT USING (true);

-- Public can submit ticket inquiries
CREATE POLICY "Public insert inquiries" ON ticket_inquiries
  FOR INSERT WITH CHECK (true);

-- Public can read about content
CREATE POLICY "Public read about_content" ON about_content
  FOR SELECT USING (true);

-- Service role bypasses RLS (admin mutations use service role key)

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read site settings (needed for layout metadata + homepage background)
CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT USING (true);

-- Default site settings
INSERT INTO site_settings (key, value) VALUES
  ('seo_title', 'Mad Hatter Comedy Club | Chicago'),
  ('seo_description', 'Chicago''s premier comedy club. Live stand-up, improv, and more in the heart of the city.'),
  ('seo_keywords', 'comedy club, Chicago, stand-up, improv, live comedy, Mad Hatter'),
  ('og_title', 'Mad Hatter Comedy Club | Chicago'),
  ('og_description', 'Chicago''s premier comedy club.'),
  ('favicon_url', ''),
  ('background_url', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- DEFAULT ABOUT CONTENT
-- ============================================

INSERT INTO about_content (section_key, title, content) VALUES
  ('hero', 'Chicago''s Premier Comedy Club', 'Mad Hatter is where Chicago comes to laugh. Located in the heart of the city, we''ve been bringing world-class comedy to the Windy City since 2015.'),
  ('story', 'Our Story', 'What started as a dream in a basement has grown into one of Chicago''s most beloved entertainment venues. Mad Hatter was born from the belief that laughter is the best medicine — and we''ve been prescribing it ever since.'),
  ('venue', 'The Venue', 'Our intimate 200-seat theater creates an electric atmosphere where every seat is a great seat. With a full bar, premium sound, and sight lines designed for comedy, Mad Hatter delivers an unforgettable night out.'),
  ('address', 'Find Us', '123 W Madison St, Chicago, IL 60602')
ON CONFLICT (section_key) DO NOTHING;

-- ============================================
-- COMEDIANS
-- ============================================

CREATE TABLE IF NOT EXISTS comedians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  headshot_url TEXT,
  social_links JSONB,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE comedians ENABLE ROW LEVEL SECURITY;

-- Public can read comedians
CREATE POLICY "Public read comedians" ON comedians
  FOR SELECT USING (true);

-- ============================================
-- TICKETING & ORDERS
-- ============================================

-- Migration to add ticketing columns to events:
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_price_cents INTEGER;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_capacity INTEGER;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- No public access — all operations via service role from API routes

-- ============================================
-- CONTACT MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public can submit contact messages
CREATE POLICY "Public insert contact_messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- ============================================
-- GALLERY
-- ============================================

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Public can view gallery
CREATE POLICY "Public read gallery_images" ON gallery_images
  FOR SELECT USING (true);

-- ============================================
-- MERCH
-- ============================================

CREATE TABLE IF NOT EXISTS merch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  tag TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE merch_items ENABLE ROW LEVEL SECURITY;

-- Public can view active merch
CREATE POLICY "Public read merch_items" ON merch_items
  FOR SELECT USING (is_active = true);
