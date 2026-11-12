import { getAdminClient } from "@/lib/supabase";
import MembershipAdmin from "@/components/admin/MembershipAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

export const dynamic = "force-dynamic";

export default async function AdminMembershipPage() {
  const db = getAdminClient();

  const [{ data: members }, { data: tiers }] = await Promise.all([
    db.from("members").select("*").order("created_at", { ascending: false }),
    db.from("membership_tiers").select("*").order("sort_order", { ascending: true }),
  ]);

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="membership" label="Membership" />
      </div>
      <MembershipAdmin
      initialMembers={members ?? []}
      initialTiers={tiers ?? []}
    />
    </>
  );
}
