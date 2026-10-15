-- Phase 4 Migration: Community & Brand — Press, Blog, Membership, Staff, Patrons, FAQs
-- Run after phase-3 migration

-- Press Articles
CREATE TABLE IF NOT EXISTS press_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_name TEXT NOT NULL,
  headline TEXT NOT NULL,
  url TEXT NOT NULL,
  publication_date DATE,
  thumbnail_url TEXT,
  featured_quote TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE press_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "press_articles_public_read" ON press_articles
  FOR SELECT USING (true);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cover_image_url TEXT,
  body TEXT NOT NULL DEFAULT '',
  author_name TEXT,
  category TEXT DEFAULT 'general',
  publish_date TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "blog_posts_public_read" ON blog_posts
  FOR SELECT USING (true);

-- Staff Members
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  photo_url TEXT,
  from_location TEXT,
  bio TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "staff_members_public_read" ON staff_members
  FOR SELECT USING (true);

-- Patrons (donors, VIPs, sponsors)
CREATE TABLE IF NOT EXISTS patrons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'donor' CHECK (type IN ('donor', 'vip', 'sponsor')),
  description TEXT,
  image_url TEXT,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE patrons ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "patrons_public_read" ON patrons
  FOR SELECT USING (true);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "faqs_public_read" ON faqs
  FOR SELECT USING (true);
