import { getAdminClient } from "@/lib/supabase";
import MembershipAdmin from "@/components/admin/MembershipAdmin";

export const dynamic = "force-dynamic";

export default async function AdminMembershipPage() {
  const db = getAdminClient();

  const [{ data: members }, { data: tiers }] = await Promise.all([
    db.from("members").select("*").order("created_at", { ascending: false }),
    db.from("membership_tiers").select("*").order("sort_order", { ascending: true }),
  ]);

  return (
    <MembershipAdmin
      initialMembers={members ?? []}
      initialTiers={tiers ?? []}
    />
  );
}
