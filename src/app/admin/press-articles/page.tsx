export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { PressArticle } from "@/lib/supabase";
import PressArticlesAdmin from "@/components/admin/PressArticlesAdmin";

async function getPressArticles(): Promise<PressArticle[]> {
  const db = getAdminClient();
  const { data } = await db
    .from("press_articles")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as PressArticle[]) ?? [];
}

export default async function AdminPressArticlesPage() {
  const articles = await getPressArticles();
  return <PressArticlesAdmin initialArticles={articles} />;
}
