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
  performer: string | null;
  date: string;
  doors_time: string | null;
  show_time: string | null;
  image_url: string | null;
  ticket_price: string | null;
  ticket_price_cents: number | null;
  ticket_capacity: number | null;
  tickets_sold: number;
  is_sold_out: boolean;
  is_featured: boolean;
  created_at: string;
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
  email: string;
  name: string | null;
  quantity: number;
  amount_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  updated_at: string;
  events?: { title: string; date: string } | null;
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
  created_at: string;
};

export type MerchItem = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
  tag: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};
