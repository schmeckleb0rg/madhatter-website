"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

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

type BlogClientProps = {
  posts: BlogPost[];
};

function getExcerpt(html: string, maxLength = 150): string {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export default function BlogClient({ posts }: BlogClientProps) {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [...new Set(posts.map((p) => p.category))];

  let filtered = filter === "all" ? posts : posts.filter((p) => p.category === filter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q)
    );
  }

  if (posts.length === 0) {
    return (
      <Reveal>
        <div className="text-center py-20">
          <p className="text-muted dark:text-[#7A7264] text-lg">No posts yet.</p>
          <p className="text-muted dark:text-[#7A7264] text-sm mt-2">Check back soon for stories from the stage.</p>
        </div>
      </Reveal>
    );
  }

  return (
    <>
      {/* Filters */}
      <Reveal>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                filter === "all"
                  ? "bg-charcoal text-off-white dark:bg-gold dark:text-[#0D0C0A]"
                  : "text-muted dark:text-[#7A7264] border border-charcoal/10 dark:border-gold/10 hover:border-gold/40"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                  filter === cat
                    ? "bg-charcoal text-off-white dark:bg-gold dark:text-[#0D0C0A]"
                    : "text-muted dark:text-[#7A7264] border border-charcoal/10 dark:border-gold/10 hover:border-gold/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex-1 w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 px-3 py-2 text-sm text-charcoal dark:text-[#F0ECE3] placeholder:text-muted/50 dark:placeholder:text-[#7A7264]/50 focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
        </div>
      </Reveal>

      {/* Posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map((post, i) => (
          <Reveal key={post.id} delay={i * 80}>
            <Link
              href={`/blog/${post.slug}`}
              className="block bg-white dark:bg-[#1C1A16] border border-charcoal/10 dark:border-gold/10 overflow-hidden group hover:border-gold/30 transition-colors"
            >
              {post.cover_image_url && (
                <div className="relative aspect-[16/9] bg-off-white-2 dark:bg-[#161412] overflow-hidden">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gold bg-gold/10 px-2 py-0.5">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted dark:text-[#7A7264]">
                    {new Date(post.publish_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold text-charcoal dark:text-[#F0ECE3] mb-1 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted dark:text-[#7A7264] line-clamp-3">
                  {getExcerpt(post.body)}
                </p>
                {post.author_name && (
                  <p className="mt-2 text-xs text-muted dark:text-[#7A7264]">
                    By {post.author_name}
                  </p>
                )}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted dark:text-[#7A7264]">No posts match your search.</p>
        </div>
      )}
    </>
  );
}
