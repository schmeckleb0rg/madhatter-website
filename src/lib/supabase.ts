import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — safe to use in browser, limited by RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only admin client — bypasses RLS, never expose to client
export function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Types
export type Event = {
  id: string;
  title: string;
  description: string | null;
  detailed_description: string | null;
  performer: string | null;
  comedian_id: string | null;
  date: string;
  doors_time: string | null;
  show_time: string | null;
  image_url: string | null;
  ticket_price: string | null;
  ticket_price_cents: number | null;
  ticket_capacity: number | null;
  tickets_sold: number;
  lineup: { name: string; role?: string }[] | null;
  is_sold_out: boolean;
  is_featured: boolean;
  created_at: string;
  // Phase 1 additions
  force_just_announced: "on" | "off" | "auto";
  selling_fast_override: "on" | "off" | "auto";
  selling_fast_threshold: number | null;
  table_preferences: string[];
  event_duration_minutes: number;
  calendar_description: string | null;
  event_category: "general" | "weekly" | "festival" | "live-taping";
  where_to_watch_later: string | null;
  audience_etiquette: string | null;
  seating_map_enabled: boolean;
  // Phase 6 additions
  timezone: string;
  end_time: string | null;
  custom_time_slots: { label: string; time: string }[] | null;
  ticket_tiers: { name: string; price_cents: number; description?: string }[] | null;
  slug: string | null;
  is_rsvp: boolean;
  // Phase 2 additions (genres via join)
  genres?: EventGenre[];
  event_series_id?: string | null;
};

export type PastEvent = {
  id: string;
  title: string;
  description: string | null;
  performer: string | null;
  date: string;
  image_url: string | null;
  created_at: string;
};

export type TicketInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_id: string | null;
  party_size: number;
  message: string | null;
  is_read: boolean;
  created_at: string;
  events?: { title: string; date: string } | null;
};

export type Comedian = {
  id: string;
  name: string;
  bio: string | null;
  headshot_url: string | null;
  social_links: { instagram?: string; website?: string } | null;
  featured: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  event_id: string | null;
  merch_item_id: string | null;
  order_type: "ticket" | "merch";
  email: string;
  name: string | null;
  quantity: number;
  amount_cents: number;
  currency: string;
  square_payment_id: string | null;
  square_order_id: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
  events?: { title: string; date: string; show_time?: string; doors_time?: string; image_url?: string } | null;
  table_preference: string | null;
  gift_card_code: string | null;
  gift_card_amount_cents: number;
  member_id: string | null;
};

export type AboutContent = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  updated_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  room_id: string | null;
  tags: string[];
  created_at: string;
};

export type MerchItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  tag: string | null;
  category: string;
  sizes: string[];
  colors: string[];
  is_limited: boolean;
  is_archive: boolean;
  inventory_count: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Room = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  features: string[];
  image_url: string | null;
  capacity: number | null;
  sort_order: number;
  created_at: string;
  room_type: string;
  virtual_tour_images: string[];
  rates: string | null;
  equipment_specs: string | null;
};

export type PrivateEventInquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  event_type: string | null;
  guest_count: number | null;
  preferred_date: string | null;
  budget_range: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

export type Subscriber = {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
};

export type EmailTemplate = {
  id: string;
  template_key: string;
  subject: string;
  body: string;
  updated_at: string;
};

export type EmailQueueItem = {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "sent" | "failed";
  event_id: string | null;
  created_at: string;
  sent_at: string | null;
};

export type EventSlideshow = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type PageContent = {
  id: string;
  page_key: string;
  section_key: string;
  content: string;
  updated_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "manager" | "staff";
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};

// Phase 1: Gift Cards
export type GiftCard = {
  id: string;
  code: string;
  balance_cents: number;
  original_amount_cents: number;
  redeemed_amount_cents: number;
  issued_to_email: string | null;
  issued_by_name: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  message: string | null;
  expires_at: string | null;
  is_voided: boolean;
  is_active: boolean;
  square_order_id: string | null;
  created_at: string;
};

export type GiftCardTransaction = {
  id: string;
  gift_card_id: string;
  amount_cents: number;
  order_id: string | null;
  type: "purchase" | "redemption" | "void";
  created_at: string;
};

// Phase 6: Promo Codes
export type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "dollars_off" | "percent_off" | "early_access";
  discount_value: number;
  event_id: string | null;
  is_site_wide: boolean;
  max_uses: number | null;
  current_uses: number;
  min_purchase_cents: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

// Phase 2: Event Genres
export type EventGenre = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

// Press Articles
export type PressArticle = {
  id: string;
  outlet_name: string;
  headline: string;
  url: string;
  publication_date: string | null;
  thumbnail_url: string | null;
  featured_quote: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
};

// Staff Members
export type StaffMember = {
  id: string;
  name: string;
  role: string;
  location: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
};

// Patrons
export type Patron = {
  id: string;
  name: string;
  type: "donor" | "vip" | "sponsor";
  tier: string | null;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
};

// FAQs
export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  created_at: string;
};
