export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { FAQ } from "@/lib/supabase";
import FAQsAdmin from "@/components/admin/FAQsAdmin";

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
  return <FAQsAdmin initialFAQs={faqs} />;
}
