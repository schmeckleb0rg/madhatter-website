export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { StaffMember } from "@/lib/supabase";
import StaffAdmin from "@/components/admin/StaffAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

async function getStaffMembers(): Promise<StaffMember[]> {
  const db = getAdminClient();
  const { data } = await db
    .from("staff_members")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as StaffMember[]) ?? [];
}

export default async function AdminStaffPage() {
  const staff = await getStaffMembers();
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="staff" label="Our Staff" />
      </div>
      <StaffAdmin initialStaff={staff} />
    </>
  );
}
