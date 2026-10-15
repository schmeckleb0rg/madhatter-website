export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { StaffMember } from "@/lib/supabase";
import StaffAdmin from "@/components/admin/StaffAdmin";

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
  return <StaffAdmin initialStaff={staff} />;
}
