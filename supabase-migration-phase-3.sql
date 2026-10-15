-- Phase 3 Migration: New Pages — Visitor Guide, Employment, Event Spaces, Classes
-- Run after phase-2 migration

-- Visitor Guide Partners (restaurants, hotels near venue)
CREATE TABLE IF NOT EXISTS visitor_guide_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'restaurant' CHECK (type IN ('restaurant', 'hotel', 'bar', 'parking', 'attraction')),
  description TEXT,
  image_url TEXT,
  link TEXT,
  affiliate_link TEXT,
  distance TEXT,
  walk_time TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visitor_guide_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "visitor_guide_partners_public_read" ON visitor_guide_partners
  FOR SELECT USING (true);

-- Job Listings
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  type TEXT NOT NULL DEFAULT 'part-time' CHECK (type IN ('full-time', 'part-time', 'gig', 'internship')),
  description TEXT,
  requirements TEXT,
  compensation TEXT,
  application_email TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "job_listings_public_read" ON job_listings
  FOR SELECT USING (true);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES job_listings(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  answers JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "job_applications_insert" ON job_applications
  FOR INSERT WITH CHECK (true);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'improv' CHECK (type IN ('improv', 'standup', 'sketch', 'writing', 'workshop')),
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all-levels')),
  duration TEXT,
  price_cents INTEGER DEFAULT 0,
  schedule TEXT,
  description TEXT,
  image_url TEXT,
  instructor TEXT,
  enrollment_status TEXT DEFAULT 'open' CHECK (enrollment_status IN ('open', 'closed', 'waitlist')),
  max_enrollment INTEGER,
  current_enrollment INTEGER DEFAULT 0,
  cohort_start_date DATE,
  path_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "classes_public_read" ON classes
  FOR SELECT USING (true);

-- Class Enrollments
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'enrolled', 'rejected')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'free')),
  square_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "class_enrollments_insert" ON class_enrollments
  FOR INSERT WITH CHECK (true);

-- Add room_type and virtual tour fields to rooms
DO $$ BEGIN
  ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'general';
  ALTER TABLE rooms ADD COLUMN IF NOT EXISTS virtual_tour_images JSONB DEFAULT '[]';
  ALTER TABLE rooms ADD COLUMN IF NOT EXISTS rates TEXT;
  ALTER TABLE rooms ADD COLUMN IF NOT EXISTS equipment_specs TEXT;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Add room_id and tags to gallery_images
DO $$ BEGIN
  ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;
  ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
