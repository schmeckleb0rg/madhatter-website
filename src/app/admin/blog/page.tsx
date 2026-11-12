export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import BlogAdmin from "@/components/admin/BlogAdmin";
import PageVisibilityToggle from "@/components/admin/PageVisibilityToggle";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  body: string;
  author_name: string | null;
  category: string;
  publish_date: string;
  is_published: boolean;
  created_at: string;
};

async function getPosts() {
  const db = getAdminClient();
  const { data } = await db
    .from("blog_posts")
    .select("*")
    .order("publish_date", { ascending: false });
  return (data as BlogPost[]) ?? [];
}

export default async function AdminBlogPage() {
  const posts = await getPosts();
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <PageVisibilityToggle pageKey="blog" label="Blog" />
      </div>
      <BlogAdmin initialPosts={posts} />
    </>
  );
}
