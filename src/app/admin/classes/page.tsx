export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import ClassesAdmin from "@/components/admin/ClassesAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

async function getClasses() {
  const db = getAdminClient();
  const { data } = await db.from("classes").select("*").order("path_order", { ascending: true });
  return data ?? [];
}

export default async function AdminClassesPage() {
  const classes = await getClasses();
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="classes" label="Classes" />
      </div>
      <ClassesAdmin initialClasses={classes} />
    </>
  );
}
