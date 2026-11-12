export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { Patron } from "@/lib/supabase";
import PatronsAdmin from "@/components/admin/PatronsAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

async function getPatrons(): Promise<Patron[]> {
  const db = getAdminClient();
  const { data } = await db
    .from("patrons")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Patron[]) ?? [];
}

export default async function AdminPatronsPage() {
  const patrons = await getPatrons();
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="patrons" label="Our Patrons" />
      </div>
      <PatronsAdmin initialPatrons={patrons} />
    </>
  );
}
