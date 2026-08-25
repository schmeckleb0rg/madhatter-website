export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import SlideshowManager from "./SlideshowManager";

export default async function AdminSlideshowPage() {
  const db = getAdminClient();
  const { data: slides } = await db.from("event_slideshow").select("*").order("sort_order", { ascending: true });

  // Get current slideshow speed setting
  const { data: settings } = await db.from("site_settings").select("key, value").eq("key", "slideshow_speed");
  const speed = settings?.[0]?.value ?? "5000";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal font-display">Slideshow</h1>
        <p className="text-sm text-muted mt-1">Manage the homepage slideshow images and settings.</p>
      </div>
      <SlideshowManager initialSlides={slides ?? []} initialSpeed={speed} />
    </div>
  );
}
