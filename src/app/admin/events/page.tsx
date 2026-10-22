export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";
import type { Event } from "@/lib/supabase";
import EventsListAdmin from "@/components/admin/EventsListAdmin";

async function getEvents(): Promise<Event[]> {
  const db = getAdminClient();
  const { data } = await db.from("events").select("*").order("date", { ascending: false });
  return data ?? [];
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-charcoal font-display">
          Events
        </h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-charcoal text-off-white text-sm font-semibold hover:bg-charcoal-2 transition-colors"
        >
          + Add Event
        </Link>
      </div>

      <EventsListAdmin events={events} />
    </div>
  );
}
