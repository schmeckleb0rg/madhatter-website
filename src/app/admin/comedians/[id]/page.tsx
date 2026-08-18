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
      <h1 className="text-2xl font-bold text-charcoal mb-8 font-display">
        Edit Comedian
      </h1>
      <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
        <ComedianForm initialData={comedian} id={comedian.id} />
      </div>
    </div>
  );
}
