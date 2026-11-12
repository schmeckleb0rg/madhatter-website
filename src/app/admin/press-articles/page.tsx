export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { PressArticle } from "@/lib/supabase";
import PressArticlesAdmin from "@/components/admin/PressArticlesAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

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
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="press" label="In The News" />
      </div>
      <PressArticlesAdmin initialArticles={articles} />
    </>
  );
}
