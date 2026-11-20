-- Inquiry Archive Support
-- Run this in the Supabase SQL Editor

ALTER TABLE ticket_inquiries ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
