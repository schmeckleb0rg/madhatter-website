export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import ComedianForm from "@/components/admin/ComedianForm";
import { notFound } from "next/navigation";

export default async function EditComedianPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminClient();
  const { data: comedian } = await db.from("comedians").select("*").eq("id", id).single();

  if (!comedian) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-8" style={{ fontFamily: "var(--font-playfair)" }}>
        Edit Comedian
      </h1>
      <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8">
        <ComedianForm initialData={comedian} id={comedian.id} />
      </div>
    </div>
  );
}
