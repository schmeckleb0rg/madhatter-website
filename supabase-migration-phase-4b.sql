-- Phase 4b: Membership & Loyalty tables

CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  price_annual_cents INTEGER NOT NULL DEFAULT 0,
  perks JSONB DEFAULT '[]',
  founding_member_price_cents INTEGER,
  founding_member_cap INTEGER,
  founding_members_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "membership_tiers_public_read" ON membership_tiers;
CREATE POLICY "membership_tiers_public_read" ON membership_tiers
  FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  points_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
-- Members can only read their own data (via service key for API routes)

CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'adjustment')),
  description TEXT,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Add member_id to orders for linking purchases
ALTER TABLE orders ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id);

-- Seed default tiers
INSERT INTO membership_tiers (name, slug, price_monthly_cents, price_annual_cents, perks, sort_order) VALUES
  ('Free', 'free', 0, 0, '["Early event announcements", "Birthday surprise", "Points on every purchase"]', 0),
  ('Mad Member', 'mad-member', 999, 9999, '["Everything in Free", "10% off all tickets", "Priority seating", "Members-only events", "2x points on purchases", "Exclusive merch drops"]', 1),
  ('Top Hat', 'top-hat', 2499, 24999, '["Everything in Mad Member", "20% off all tickets", "Free ticket monthly (select shows)", "VIP seating", "3x points on purchases", "Backstage access (select shows)", "Complimentary drink per visit"]', 2)
ON CONFLICT (slug) DO NOTHING;
