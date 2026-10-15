export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import ClassesAdmin from "@/components/admin/ClassesAdmin";

async function getClasses() {
  const db = getAdminClient();
  const { data } = await db.from("classes").select("*").order("path_order", { ascending: true });
  return data ?? [];
}

export default async function AdminClassesPage() {
  const classes = await getClasses();
  return <ClassesAdmin initialClasses={classes} />;
}
