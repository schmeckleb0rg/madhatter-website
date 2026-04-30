export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import EventForm from "@/components/admin/EventForm";
import { notFound } from "next/navigation";

export default async function EditPastEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminClient();
  const { data: event } = await db.from("past_events").select("*").eq("id", id).single();

  if (!event) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: "var(--font-playfair)" }}>
        Edit Past Show
      </h1>
      <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8">
        <EventForm type="past-event" initialData={event} id={event.id} />
      </div>
    </div>
  );
}
