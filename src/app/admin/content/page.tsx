export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import ContentEditorForm from "./ContentEditorForm";

export default async function AdminContentPage() {
  const db = getAdminClient();
  const { data } = await db.from("page_content").select("*").order("page_key").order("section_key");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal font-display">Site Content</h1>
        <p className="text-sm text-muted mt-1">Edit text content displayed across the public site pages.</p>
      </div>
      <ContentEditorForm initial={data ?? []} />
    </div>
  );
}
