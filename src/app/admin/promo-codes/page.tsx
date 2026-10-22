import { getAdminClient } from "@/lib/supabase";
import PromoCodesAdmin from "@/components/admin/PromoCodesAdmin";

export default async function PromoCodesPage() {
  const db = getAdminClient();
  const { data } = await db
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return <PromoCodesAdmin initialCodes={data ?? []} />;
}
