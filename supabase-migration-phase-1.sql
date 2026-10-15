-- Phase 1 Migration: Core Conversion
-- Run this against your Supabase database

-- =====================================================
-- 1. ALTER events table: new fields for badges, checkout, calendar
-- =====================================================
DO $$ BEGIN
  ALTER TABLE events ADD COLUMN IF NOT EXISTS force_just_announced TEXT DEFAULT 'auto';
  ALTER TABLE events ADD COLUMN IF NOT EXISTS selling_fast_override TEXT DEFAULT 'auto';
  ALTER TABLE events ADD COLUMN IF NOT EXISTS selling_fast_threshold INTEGER;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS table_preferences JSONB DEFAULT '[]';
  ALTER TABLE events ADD COLUMN IF NOT EXISTS event_duration_minutes INTEGER DEFAULT 120;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS calendar_description TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS event_category TEXT DEFAULT 'general';
  ALTER TABLE events ADD COLUMN IF NOT EXISTS where_to_watch_later TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS audience_etiquette TEXT;
  ALTER TABLE events ADD COLUMN IF NOT EXISTS seating_map_enabled BOOLEAN DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Add check constraints
DO $$ BEGIN
  ALTER TABLE events ADD CONSTRAINT events_force_just_announced_check
    CHECK (force_just_announced IN ('on', 'off', 'auto'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD CONSTRAINT events_selling_fast_override_check
    CHECK (selling_fast_override IN ('on', 'off', 'auto'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE events ADD CONSTRAINT events_event_category_check
    CHECK (event_category IN ('general', 'weekly', 'festival', 'live-taping'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 2. ALTER orders table: gift card + table preference + member
-- =====================================================
DO $$ BEGIN
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_preference TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_card_code TEXT;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_card_amount_cents INTEGER DEFAULT 0;
  ALTER TABLE orders ADD COLUMN IF NOT EXISTS member_id UUID;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- 3. Gift Cards table
-- =====================================================
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  balance_cents INTEGER NOT NULL,
  original_amount_cents INTEGER NOT NULL,
  redeemed_amount_cents INTEGER DEFAULT 0,
  issued_to_email TEXT,
  issued_by_name TEXT,
  recipient_name TEXT,
  recipient_email TEXT,
  message TEXT,
  expires_at TIMESTAMPTZ,
  is_voided BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  square_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for gift_cards
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read for gift card lookup" ON gift_cards
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow service role full access on gift_cards" ON gift_cards
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 4. Gift Card Transactions table
-- =====================================================
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'redemption', 'void')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow service role full access on gift_card_transactions" ON gift_card_transactions
    FOR ALL USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- 5. Seed site_settings for Phase 1
-- =====================================================
INSERT INTO site_settings (key, value) VALUES
  ('just_announced_days', '14'),
  ('selling_fast_default_threshold', '70'),
  ('gift_card_denominations', '[2500, 5000, 10000, 15000]'),
  ('gift_card_expiry_days', '365'),
  ('gift_card_custom_min', '1000'),
  ('gift_card_custom_max', '50000'),
  ('confirmation_page_text', 'Your tickets have been confirmed. We can''t wait to see you!'),
  ('confirmation_cta_text', 'Browse More Shows')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 6. Add email templates for gift cards and ticket confirmation
-- =====================================================
INSERT INTO email_templates (template_key, subject, body) VALUES
  ('ticket_confirmation', 'Your Mad Hatter Tickets — {{event_title}}',
   '<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F6F2E9; padding: 40px 24px;">'
   '<div style="text-align: center; margin-bottom: 32px;">'
   '<h1 style="color: #1B1A17; font-size: 28px; margin: 0;">You''re In!</h1>'
   '<p style="color: #6E6759; font-size: 14px; margin-top: 8px;">Your tickets for {{event_title}} are confirmed.</p>'
   '</div>'
   '<div style="background: white; border: 1px solid rgba(27,26,23,0.1); padding: 24px;">'
   '<p style="color: #6E6759; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px;">Order Details</p>'
   '<p style="margin: 4px 0;"><strong>Event:</strong> {{event_title}}</p>'
   '<p style="margin: 4px 0;"><strong>Date:</strong> {{event_date}}</p>'
   '<p style="margin: 4px 0;"><strong>Time:</strong> {{event_time}}</p>'
   '<p style="margin: 4px 0;"><strong>Tickets:</strong> {{ticket_quantity}}</p>'
   '<p style="margin: 4px 0;"><strong>Total:</strong> {{total_amount}}</p>'
   '</div>'
   '<div style="text-align: center; margin-top: 32px;">'
   '<p style="color: #6E6759; font-size: 13px;">Mad Hatter Comedy Club</p>'
   '<p style="color: #B8934A; font-size: 12px;">Full bar available. 21+ show.</p>'
   '</div>'
   '</div>'),
  ('gift_card', 'You''ve Received a Mad Hatter Gift Card!',
   '<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #1B1A17; padding: 40px 24px; color: #F6F2E9;">'
   '<div style="text-align: center; margin-bottom: 32px;">'
   '<h1 style="color: #B8934A; font-size: 28px; margin: 0;">Mad Hatter</h1>'
   '<p style="font-size: 14px; margin-top: 4px; color: #F6F2E9;">Comedy Club Gift Card</p>'
   '</div>'
   '<div style="background: #252420; border: 1px solid rgba(184,147,74,0.2); padding: 32px; text-align: center;">'
   '<p style="color: #B8934A; font-size: 42px; font-weight: bold; margin: 0;">{{gift_card_amount}}</p>'
   '<p style="color: #6E6759; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; margin: 16px 0 0;">Gift Card Code</p>'
   '<p style="color: #F6F2E9; font-size: 24px; font-family: monospace; letter-spacing: 4px; margin: 8px 0;">{{gift_card_code}}</p>'
   '{{#if gift_card_message}}<div style="border-top: 1px solid rgba(184,147,74,0.2); margin-top: 24px; padding-top: 16px;"><p style="color: #F6F2E9; font-style: italic;">\"{{gift_card_message}}\"</p><p style="color: #6E6759; font-size: 13px;">— {{gift_card_sender}}</p></div>{{/if}}'
   '</div>'
   '<div style="text-align: center; margin-top: 24px;">'
   '<p style="color: #6E6759; font-size: 13px;">Redeem at madhattercomedy.com or at the box office.</p>'
   '<p style="color: #6E6759; font-size: 12px;">Expires: {{gift_card_expiry}}</p>'
   '</div>'
   '</div>')
ON CONFLICT (template_key) DO NOTHING;
