export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import BlogAdmin from "@/components/admin/BlogAdmin";

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
  return <BlogAdmin initialPosts={posts} />;
}
