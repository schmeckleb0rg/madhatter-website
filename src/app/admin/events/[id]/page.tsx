export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import EventForm from "@/components/admin/EventForm";
import ExportCsvButton from "@/components/admin/ExportCsvButton";
import { notFound } from "next/navigation";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminClient();

  const [{ data: event }, { data: orders }] = await Promise.all([
    db.from("events").select("*").eq("id", id).single(),
    db.from("orders")
      .select("name, email, quantity, amount_cents, status, created_at")
      .eq("event_id", id)
      .eq("order_type", "ticket")
      .eq("status", "completed")
      .order("created_at", { ascending: false }),
  ]);

  if (!event) notFound();

  const attendees = orders ?? [];
  const totalAttendees = attendees.reduce((s, o) => s + o.quantity, 0);
  const totalRevenueCents = attendees.reduce((s, o) => s + o.amount_cents, 0);
  const revenue = (totalRevenueCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

  const csvHeader = ["Name", "Email", "Quantity", "Amount", "Date"];
  const csvRows = attendees.map((a) => [
    a.name || "—",
    a.email,
    String(a.quantity),
    a.amount_cents > 0 ? `$${(a.amount_cents / 100).toFixed(2)}` : "RSVP",
    new Date(a.created_at).toLocaleDateString(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-charcoal mb-8 font-display">
        Edit Event
      </h1>
      <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
        <EventForm type="event" initialData={event} id={event.id} />
      </div>

      {/* Attendee List */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted">
              Attendees ({totalAttendees})
            </h2>
            {attendees.length > 0 && (
              <p className="text-xs text-muted mt-1">{attendees.length} orders — {revenue} revenue</p>
            )}
          </div>
          {attendees.length > 0 && (
            <ExportCsvButton
              filename={`attendees-${event.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.csv`}
              rows={[csvHeader, ...csvRows]}
            />
          )}
        </div>

        {attendees.length === 0 ? (
          <p className="text-sm text-muted italic py-6">No attendees yet for this event.</p>
        ) : (
          <div className="bg-white border border-charcoal/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Name</th>
                  <th className="text-left px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Email</th>
                  <th className="text-center px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Qty</th>
                  <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Amount</th>
                  <th className="text-right px-3 py-2 text-xs text-muted font-medium uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((guest, i) => (
                  <tr key={i} className="border-b border-charcoal/5 last:border-0">
                    <td className="px-3 py-2 text-charcoal">{guest.name || "—"}</td>
                    <td className="px-3 py-2 text-muted">{guest.email}</td>
                    <td className="px-3 py-2 text-center text-charcoal">{guest.quantity}</td>
                    <td className="px-3 py-2 text-right text-charcoal font-mono">
                      {guest.amount_cents > 0
                        ? `$${(guest.amount_cents / 100).toFixed(2)}`
                        : "RSVP"}
                    </td>
                    <td className="px-3 py-2 text-right text-muted text-xs">
                      {new Date(guest.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
