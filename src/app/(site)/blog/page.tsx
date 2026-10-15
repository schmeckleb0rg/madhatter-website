import { supabase } from "@/lib/supabase";
import BlogClient from "@/components/BlogClient";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export const metadata = {
  title: "From The Stage | Mad Hatter Comedy Club Blog",
  description:
    "Stories, spotlights, and updates from Mad Hatter Comedy Club. Comedian features, show recaps, and behind-the-scenes.",
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  body: string;
  author_name: string | null;
  category: string;
  publish_date: string;
};

async function getPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, cover_image_url, body, author_name, category, publish_date")
    .eq("is_published", true)
    .order("publish_date", { ascending: false });
  return (data as BlogPost[]) ?? [];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest uppercase text-gold mb-3">
              Stories & Updates
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-none tracking-tight">
              <span className="font-display italic text-muted block dark:text-[#7A7264]">From</span>
              <span className="font-display font-semibold text-charcoal block dark:text-[#F0ECE3]">The Stage</span>
            </h1>
            <div className="flex items-center gap-4 mt-6 justify-center">
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
              <span className="font-mono text-xs tracking-widest uppercase text-gold">Blog</span>
              <div className="w-12 h-px bg-charcoal/10 dark:bg-gold/15" />
            </div>
          </div>
        </Reveal>

        <BlogClient posts={posts} />
      </div>
    </div>
  );
}
