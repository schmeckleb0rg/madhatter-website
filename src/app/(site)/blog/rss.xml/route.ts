import { supabase } from "@/lib/supabase";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title, slug, body, author_name, publish_date, cover_image_url")
    .eq("is_published", true)
    .order("publish_date", { ascending: false })
    .limit(50);

  const items = (posts ?? [])
    .map((post: { title: string; slug: string; body: string; author_name: string | null; publish_date: string }) => {
      const description = post.body.replace(/<[^>]*>/g, "").slice(0, 300);
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid>${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${description}]]></description>
      ${post.author_name ? `<author>${post.author_name}</author>` : ""}
      <pubDate>${new Date(post.publish_date).toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>From The Stage | Mad Hatter Comedy Club</title>
    <link>${siteUrl}/blog</link>
    <description>Stories, spotlights, and updates from Mad Hatter Comedy Club.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
