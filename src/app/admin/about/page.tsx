export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import AboutEditor from "./AboutEditor";
import type { AboutContent } from "@/lib/supabase";

async function getAboutContent(): Promise<AboutContent[]> {
  const db = getAdminClient();
  const { data } = await db.from("about_content").select("*").order("section_key");
  return data ?? [];
}

export default async function AdminAboutPage() {
  const sections = await getAboutContent();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
        About Page Content
      </h1>
      <p className="text-sm text-gray-500 mb-8">Edit the text that appears on the public About page.</p>

      <div className="space-y-4">
        {sections.map((section) => (
          <AboutEditor key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
