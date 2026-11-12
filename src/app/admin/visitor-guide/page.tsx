export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import VisitorGuideAdmin from "@/components/admin/VisitorGuideAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

type Partner = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  image_url: string | null;
  link: string | null;
  affiliate_link: string | null;
  distance: string | null;
  walk_time: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

async function getPartners(): Promise<Partner[]> {
  const db = getAdminClient();
  const { data } = await db.from("visitor_guide_partners").select("*").order("sort_order", { ascending: true });
  return (data as Partner[]) ?? [];
}

export default async function AdminVisitorGuidePage() {
  const partners = await getPartners();
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="visitor_info" label="Visitor Info" />
      </div>
      <VisitorGuideAdmin initialPartners={partners} />
    </>
  );
}
