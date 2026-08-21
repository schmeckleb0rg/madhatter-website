import { supabase } from "@/lib/supabase";

export type VenueInfo = {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  eventsEmail: string;
  merchEmail: string;
  mapLat: string;
  mapLng: string;
  hoursMon: string;
  hoursFri: string;
  hoursSun: string;
};

const DEFAULTS: VenueInfo = {
  street: "123 W Madison St",
  city: "Chicago",
  state: "IL",
  zip: "60602",
  phone: "(312) 555-0100",
  email: "hello@madhattercomedy.com",
  eventsEmail: "events@madhattercomedy.com",
  merchEmail: "merch@madhattercomedy.com",
  mapLat: "41.8819",
  mapLng: "-87.6318",
  hoursMon: "6 PM – 11 PM",
  hoursFri: "6 PM – 1 AM",
  hoursSun: "5 PM – 10 PM",
};

export async function getVenueInfo(): Promise<VenueInfo> {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "venue_street", "venue_city", "venue_state", "venue_zip",
      "venue_phone", "venue_email", "venue_events_email", "venue_merch_email",
      "venue_map_lat", "venue_map_lng",
      "hours_mon_thu", "hours_fri_sat", "hours_sun",
    ]);

  const s: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    if (row.value) s[row.key] = row.value;
  });

  return {
    street: s.venue_street || DEFAULTS.street,
    city: s.venue_city || DEFAULTS.city,
    state: s.venue_state || DEFAULTS.state,
    zip: s.venue_zip || DEFAULTS.zip,
    phone: s.venue_phone || DEFAULTS.phone,
    email: s.venue_email || DEFAULTS.email,
    eventsEmail: s.venue_events_email || DEFAULTS.eventsEmail,
    merchEmail: s.venue_merch_email || DEFAULTS.merchEmail,
    mapLat: s.venue_map_lat || DEFAULTS.mapLat,
    mapLng: s.venue_map_lng || DEFAULTS.mapLng,
    hoursMon: s.hours_mon_thu || DEFAULTS.hoursMon,
    hoursFri: s.hours_fri_sat || DEFAULTS.hoursFri,
    hoursSun: s.hours_sun || DEFAULTS.hoursSun,
  };
}

export function fullAddress(v: VenueInfo): string {
  return `${v.street}, ${v.city}, ${v.state} ${v.zip}`;
}

export function phoneHref(v: VenueInfo): string {
  return `tel:+1${v.phone.replace(/\D/g, "")}`;
}

export function mapEmbedUrl(v: VenueInfo): string {
  const q = encodeURIComponent(`${v.street}, ${v.city}, ${v.state} ${v.zip}`);
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.4!2d${v.mapLng}!3d${v.mapLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${q}!5e0!3m2!1sen!2sus!4v1`;
}
