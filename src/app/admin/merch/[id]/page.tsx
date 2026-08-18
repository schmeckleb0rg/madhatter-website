export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import MerchForm from "@/components/admin/MerchForm";
import { notFound } from "next/navigation";

export default async function EditMerchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminClient();
  const { data: item } = await db.from("merch_items").select("*").eq("id", id).single();

  if (!item) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-charcoal mb-8 font-display">
        Edit Merch Item
      </h1>
      <div className="bg-white border border-charcoal/10 p-6 sm:p-8">
        <MerchForm initialData={item} id={item.id} />
      </div>
    </div>
  );
}
