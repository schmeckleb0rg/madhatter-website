export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import VisitorGuideAdmin from "@/components/admin/VisitorGuideAdmin";

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
  return <VisitorGuideAdmin initialPartners={partners} />;
}
