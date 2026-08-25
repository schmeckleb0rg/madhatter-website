export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminRoomsPage() {
  const db = getAdminClient();
  const { data: rooms } = await db.from("rooms").select("*").order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-charcoal font-display">Rooms</h1>
          <p className="text-sm text-muted mt-1">Manage venue rooms and spaces.</p>
        </div>
        <Link
          href="/admin/rooms/new"
          className="text-xs px-4 py-2 bg-charcoal text-off-white hover:bg-charcoal-2 transition-colors"
        >
          + Add Room
        </Link>
      </div>

      {(!rooms || rooms.length === 0) ? (
        <div className="bg-white border border-charcoal/10 p-8 text-center">
          <p className="text-sm text-muted">No rooms yet. Add your first room to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/admin/rooms/${room.id}`}
              className="block bg-white border border-charcoal/10 p-5 hover:border-gold/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-charcoal">{room.name}</h2>
                  <p className="text-xs text-muted mt-0.5">
                    /{room.slug}
                    {room.capacity ? ` -- Capacity: ${room.capacity}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted">Edit</span>
              </div>
              {room.description && (
                <p className="text-xs text-muted mt-2 line-clamp-2">{room.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
