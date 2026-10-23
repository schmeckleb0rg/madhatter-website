-- Migration: Add Terms & Conditions and Privacy Policy seed rows
-- These empty rows allow the admin to see and edit the content in the Site Content editor.
-- The buttons will NOT appear on the public website until an admin saves non-empty content.

INSERT INTO page_content (page_key, section_key, content, updated_at) VALUES
  ('terms', 'statement', '', NOW()),
  ('privacy', 'statement', '', NOW())
ON CONFLICT (page_key, section_key) DO NOTHING;
