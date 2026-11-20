-- Email Tracking: Recipients, Opens, Clicks, and Scheduled Send
-- Run this in the Supabase SQL Editor

-- Add scheduled_for column to email_queue
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
-- Add recipient_count for sent emails
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0;

-- Track individual recipients per sent email
CREATE TABLE IF NOT EXISTS email_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES email_queue(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_recipients_queue_id ON email_recipients(queue_id);

-- Track opens and clicks
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES email_queue(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_tracking_queue_id ON email_tracking(queue_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_event ON email_tracking(queue_id, event_type);

ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;
