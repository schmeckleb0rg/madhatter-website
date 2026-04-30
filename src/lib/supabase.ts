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

export type AboutContent = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
  updated_at: string;
};
