-- Phase 7: Admin Events Overhaul — Cancel Event + Per-Event Email Templates

-- Add cancellation fields to events table
DO $$ BEGIN ALTER TABLE events ADD COLUMN is_cancelled BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE events ADD COLUMN cancellation_reason TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE events ADD COLUMN cancelled_at TIMESTAMPTZ; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Per-event email templates
CREATE TABLE IF NOT EXISTS event_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('confirmation', 'cancellation', 'event_cancellation', 'reminder')),
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, template_type)
);

ALTER TABLE event_email_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_event_email_templates_event ON event_email_templates(event_id);
