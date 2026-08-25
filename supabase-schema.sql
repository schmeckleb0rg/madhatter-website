-- Mad Hatter Comedy Club — Supabase Schema
-- Run this in the Supabase SQL editor
-- Safe to run multiple times — all CREATE TABLE, CREATE POLICY, and INSERT statements are idempotent.

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  detailed_description TEXT,
  performer TEXT,
  comedian_id UUID,
  date TIMESTAMPTZ NOT NULL,
  doors_time TEXT,
  show_time TEXT,
  image_url TEXT,
  ticket_price TEXT,
  ticket_price_cents INTEGER,
  ticket_capacity INTEGER,
  lineup JSONB DEFAULT '[]'::jsonb,
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

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comedians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  headshot_url TEXT,
  social_links JSONB,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  merch_item_id UUID,
  order_type TEXT NOT NULL DEFAULT 'ticket',
  email TEXT NOT NULL,
  name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  square_payment_id TEXT,
  square_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  tag TEXT,
  category TEXT DEFAULT 'apparel',
  sizes JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  is_limited BOOLEAN DEFAULT false,
  is_archive BOOLEAN DEFAULT false,
  inventory_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS event_slideshow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page_key, section_key)
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('manager', 'staff')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comedians ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_event_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_slideshow ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES (idempotent — safe to re-run)
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='events' AND policyname='Public read events') THEN
    CREATE POLICY "Public read events" ON events FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='past_events' AND policyname='Public read past_events') THEN
    CREATE POLICY "Public read past_events" ON past_events FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ticket_inquiries' AND policyname='Public insert inquiries') THEN
    CREATE POLICY "Public insert inquiries" ON ticket_inquiries FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='about_content' AND policyname='Public read about_content') THEN
    CREATE POLICY "Public read about_content" ON about_content FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='site_settings' AND policyname='Public read site_settings') THEN
    CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='comedians' AND policyname='Public read comedians') THEN
    CREATE POLICY "Public read comedians" ON comedians FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contact_messages' AND policyname='Public insert contact_messages') THEN
    CREATE POLICY "Public insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='gallery_images' AND policyname='Public read gallery_images') THEN
    CREATE POLICY "Public read gallery_images" ON gallery_images FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='merch_items' AND policyname='Public read merch_items') THEN
    CREATE POLICY "Public read merch_items" ON merch_items FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rooms' AND policyname='Public read rooms') THEN
    CREATE POLICY "Public read rooms" ON rooms FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='private_event_inquiries' AND policyname='Public insert private_event_inquiries') THEN
    CREATE POLICY "Public insert private_event_inquiries" ON private_event_inquiries FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscribers' AND policyname='Public insert subscribers') THEN
    CREATE POLICY "Public insert subscribers" ON subscribers FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_slideshow' AND policyname='Public read event_slideshow') THEN
    CREATE POLICY "Public read event_slideshow" ON event_slideshow FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='page_content' AND policyname='Public read page_content') THEN
    CREATE POLICY "Public read page_content" ON page_content FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================
-- ENSURE UNIQUE CONSTRAINTS EXIST
-- (safe if constraint already exists — exception is caught and ignored)
-- ============================================

DO $$ BEGIN ALTER TABLE about_content ADD UNIQUE (section_key); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE rooms ADD UNIQUE (slug); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE email_templates ADD UNIQUE (template_key); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE subscribers ADD UNIQUE (email); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE admin_users ADD UNIQUE (email); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE page_content ADD UNIQUE (page_key, section_key); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- DEFAULT DATA (all use ON CONFLICT DO NOTHING)
-- ============================================

INSERT INTO site_settings (key, value) VALUES
  ('seo_title', 'Mad Hatter Comedy Club | Chicago'),
  ('seo_description', 'Chicago''s premier comedy club. Live stand-up, improv, and more in the heart of the city.'),
  ('seo_keywords', 'comedy club, Chicago, stand-up, improv, live comedy, Mad Hatter'),
  ('og_title', 'Mad Hatter Comedy Club | Chicago'),
  ('og_description', 'Chicago''s premier comedy club.'),
  ('favicon_url', ''),
  ('background_url', ''),
  ('og_image_url', ''),
  ('app_icon_url', ''),
  ('social_instagram', ''),
  ('social_tiktok', ''),
  ('social_facebook', ''),
  ('social_youtube', ''),
  ('slideshow_speed', '5'),
  ('venue_street', '1046 W Kinzie St'),
  ('venue_city', 'Chicago'),
  ('venue_state', 'IL'),
  ('venue_zip', '60642'),
  ('venue_phone', ''),
  ('venue_email', ''),
  ('venue_events_email', ''),
  ('venue_merch_email', ''),
  ('venue_map_lat', '41.8893'),
  ('venue_map_lng', '-87.6583'),
  ('hours_mon_thu', '6 PM – 11 PM'),
  ('hours_fri_sat', '6 PM – 1 AM'),
  ('hours_sun', '5 PM – 10 PM')
ON CONFLICT DO NOTHING;

INSERT INTO about_content (section_key, title, content) VALUES
  ('hero', 'Chicago''s Premier Comedy Club', 'Mad Hatter is where Chicago comes to laugh. Located in the heart of the city, we''ve been bringing world-class comedy to the Windy City since 2026.'),
  ('story', 'Our Story', 'What started as a dream in a basement has grown into one of Chicago''s most beloved entertainment venues. Mad Hatter was born from the belief that laughter is the best medicine — and we''ve been prescribing it ever since.'),
  ('venue', 'The Venue', 'Our intimate 200-seat theater creates an electric atmosphere where every seat is a great seat. With a full bar, premium sound, and sight lines designed for comedy, Mad Hatter delivers an unforgettable night out.'),
  ('address', 'Find Us', '1046 W Kinzie St, Chicago, IL 60642')
ON CONFLICT DO NOTHING;

INSERT INTO rooms (name, slug, description, features, capacity, sort_order) VALUES
  ('Main Stage', 'main-stage', 'The primary event space where the magic happens. Our Main Stage hosts all headline shows, special events, and large-format performances. With premium sound, professional lighting, and tiered seating designed for comedy, every seat in the house delivers an unforgettable experience.', '["Professional sound system", "Stage lighting", "Tiered seating", "Full bar service", "VIP seating available"]'::jsonb, 200, 1),
  ('Green Room', 'green-room', 'The backstage sanctuary where talent gathers before and after shows. Our Green Room is where comedians, performers, and special guests prepare for their sets and unwind after bringing the house down. A private space that buzzes with creative energy.', '["Private backstage area", "Performer lounge", "Pre-show preparation", "Post-show meet & greet space"]'::jsonb, NULL, 2),
  ('Jazz Room', 'jazz-room', 'A no-reservations, first-come-first-serve piano jazz bar where guests can unwind with live jazz, craft cocktails, and spontaneous vibes. The Jazz Room also offers last-minute seats and walk-in entry to shows when available — perfect for those who like to keep things spontaneous.', '["Live piano jazz", "No reservations needed", "Craft cocktail bar", "Walk-in show entry when available", "Intimate atmosphere"]'::jsonb, 50, 3)
ON CONFLICT DO NOTHING;

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
ON CONFLICT DO NOTHING;

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
  ('contact', 'description', 'Questions about shows, private events, or just want to say hello? We''d love to hear from you.'),
  ('ticker', 'item_1', 'Live Stand-Up Comedy'),
  ('ticker', 'item_2', 'Book Your Tickets Now'),
  ('ticker', 'item_3', 'Chicago''s Best Comedy Club'),
  ('ticker', 'item_4', 'New Shows Added Weekly')
ON CONFLICT DO NOTHING;

-- ============================================
-- ADMIN USERS NOTE
-- ============================================
-- admin_users has no public RLS policies — accessed only via service role.
-- After running this schema, create your first admin account by visiting:
--   https://your-site.com/api/admin/seed-users
-- (only works when admin_users table is empty — one-time bootstrap)
