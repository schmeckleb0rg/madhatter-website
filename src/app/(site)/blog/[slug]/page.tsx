import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ShareBar from "@/components/ShareBar";
import Reveal from "@/components/Reveal";
import { ArticleSchema } from "@/components/StructuredData";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

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

async function getPost(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data as BlogPost | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const description = post.body.replace(/<[^>]*>/g, "").slice(0, 160);

  return {
    title: `${post.title} | Mad Hatter Comedy Club`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `${siteUrl}/blog/${slug}`,
      publishedTime: post.publish_date,
      authors: post.author_name ? [post.author_name] : undefined,
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const postUrl = `${siteUrl}/blog/${slug}`;
  const dateStr = new Date(post.publish_date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen bg-off-white dark:bg-[#0D0C0A]">
      <ArticleSchema article={post} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted dark:text-[#7A7264] hover:text-charcoal dark:hover:text-[#F0ECE3] transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Posts
        </Link>

        {/* Cover image */}
        {post.cover_image_url && (
          <Reveal>
            <div className="relative aspect-video w-full bg-off-white-2 dark:bg-[#161412] overflow-hidden mb-8">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          </Reveal>
        )}

        {/* Meta */}
        <Reveal>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5">
                {post.category}
              </span>
              <span className="text-xs text-muted dark:text-[#7A7264]">{dateStr}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-charcoal dark:text-[#F0ECE3] leading-tight">
              {post.title}
            </h1>
            {post.author_name && (
              <p className="text-sm text-muted dark:text-[#7A7264] mt-2">
                By {post.author_name}
              </p>
            )}
          </div>
        </Reveal>

        {/* Body */}
        <Reveal>
          <div
            className="prose prose-charcoal dark:prose-invert max-w-none mb-8
              prose-headings:font-display prose-headings:text-charcoal dark:prose-headings:text-[#F0ECE3]
              prose-p:text-muted dark:prose-p:text-[#C4BDA8] prose-p:leading-relaxed
              prose-a:text-gold prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-gold prose-blockquote:text-muted dark:prose-blockquote:text-[#7A7264]
              prose-img:rounded-none"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </Reveal>

        {/* Share */}
        <Reveal>
          <div className="pt-6 border-t border-charcoal/10 dark:border-gold/10">
            <ShareBar
              url={postUrl}
              title={post.title}
              description={`${post.title} — From The Stage at Mad Hatter Comedy Club`}
              imageUrl={post.cover_image_url || undefined}
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
