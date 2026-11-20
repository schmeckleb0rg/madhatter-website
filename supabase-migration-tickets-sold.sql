-- Add tickets_sold column to events table
-- Run this in the Supabase SQL Editor

ALTER TABLE events ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0;
