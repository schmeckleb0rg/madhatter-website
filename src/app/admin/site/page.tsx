export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import SiteSettingsForm from "./SiteSettingsForm";

async function getSiteSettings() {
  const db = getAdminClient();
  const { data } = await db.from("site_settings").select("key, value");
  const settings: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export default async function AdminSitePage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
          Site Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage SEO, favicon, and the coming soon background.</p>
      </div>
      <SiteSettingsForm initial={settings} />
    </div>
  );
}
