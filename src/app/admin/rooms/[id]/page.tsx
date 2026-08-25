export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import RoomForm from "@/components/admin/RoomForm";
import { notFound } from "next/navigation";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminClient();
  const { data: room } = await db.from("rooms").select("*").eq("id", id).single();

  if (!room) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-charcoal mb-8 font-display">Edit Room</h1>
      <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
        <RoomForm initialData={room} id={room.id} />
      </div>
    </div>
  );
}
