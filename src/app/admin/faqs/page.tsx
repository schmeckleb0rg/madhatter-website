export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { FAQ } from "@/lib/supabase";
import FAQsAdmin from "@/components/admin/FAQsAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

async function getFAQs(): Promise<FAQ[]> {
  const db = getAdminClient();
  const { data } = await db
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as FAQ[]) ?? [];
}

export default async function AdminFAQsPage() {
  const faqs = await getFAQs();
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="faqs" label="FAQs" />
      </div>
      <FAQsAdmin initialFAQs={faqs} />
    </>
  );
}
