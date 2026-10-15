export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { Patron } from "@/lib/supabase";
import PatronsAdmin from "@/components/admin/PatronsAdmin";

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
  return <PatronsAdmin initialPatrons={patrons} />;
}
