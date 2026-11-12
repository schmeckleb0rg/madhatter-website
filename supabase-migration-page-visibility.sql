-- Page Visibility: Hide specified pages from public nav/footer
-- Run this in Supabase SQL Editor to set initial hidden state
-- These pages will be hidden from navigation but still accessible via direct URL
-- Admin can toggle visibility at any time from each page's /admin editor

INSERT INTO site_settings (key, value, updated_at)
VALUES
  ('page_visible_festivals', 'false', now()),
  ('page_visible_classes', 'false', now()),
  ('page_visible_staff', 'false', now()),
  ('page_visible_patrons', 'false', now()),
  ('page_visible_press', 'false', now()),
  ('page_visible_past_events', 'false', now()),
  ('page_visible_comedians', 'false', now()),
  ('page_visible_merch', 'false', now()),
  -- New pages (default visible)
  ('page_visible_faqs', 'true', now()),
  ('page_visible_about', 'true', now()),
  ('page_visible_visitor_info', 'true', now()),
  ('page_visible_gift_cards', 'true', now()),
  ('page_visible_event_spaces', 'true', now()),
  ('page_visible_blog', 'true', now()),
  ('page_visible_employment', 'true', now()),
  ('page_visible_membership', 'true', now()),
  ('page_visible_gallery', 'true', now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
