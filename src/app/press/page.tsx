import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { GalleryImage } from "@/lib/supabase";

export const revalidate = 60;

export const metadata = {
  title: "Media & Press | Mad Hatter Comedy Club",
  description: "Press kit, media inquiries, and gallery for Mad Hatter Comedy Club in Chicago.",
};

const pressFeatures = [
  { outlet: "Chicago Tribune", quote: "One of Chicago's best-kept comedy secrets." },
  { outlet: "TimeOut Chicago", quote: "An intimate room with world-class talent." },
  { outlet: "Block Club Chicago", quote: "Where Chicago's next comedy stars are born." },
];

async function getGalleryImages(): Promise<GalleryImage[]> {
  const { data } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as GalleryImage[]) ?? [];
}

export default async function PressPage() {
  const galleryImages = await getGalleryImages();

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-club-gold text-xs font-bold tracking-widest uppercase mb-3">
            In the Spotlight
          </p>
          <h1
            className="text-4xl sm:text-5xl font-black text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Media & Press
          </h1>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Press inquiries, media resources, and highlights from Mad Hatter Comedy Club.
          </p>
          <div className="mt-4 text-club-gold tracking-widest opacity-30">&#9824; &#9829; &#9827; &#9830;</div>
        </div>

        {/* Press Kit */}
        <div className="bg-club-card border border-club-border rounded-lg p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Press Kit
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Everything you need for coverage and features.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-club-bg border border-club-border rounded p-4">
              <div className="text-club-gold font-semibold mb-2">Venue Facts</div>
              <ul className="space-y-1 text-gray-400">
                <li>200-seat intimate comedy venue</li>
                <li>Located in downtown Chicago</li>
                <li>Open since 2015</li>
                <li>200+ shows hosted annually</li>
                <li>Full bar with craft cocktails</li>
              </ul>
            </div>
            <div className="bg-club-bg border border-club-border rounded p-4">
              <div className="text-club-gold font-semibold mb-2">Media Contact</div>
              <div className="space-y-2 text-gray-400">
                <p>For press inquiries, interviews, and media passes:</p>
                <a
                  href="mailto:press@madhattercomedy.com"
                  className="text-club-red hover:underline block"
                >
                  press@madhattercomedy.com
                </a>
                <p className="text-xs text-gray-600 mt-2">
                  Please allow 48 hours for a response. Media passes subject to availability.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="text-xs text-gray-500 bg-club-bg border border-club-border rounded px-3 py-1.5">
              Logo files available on request
            </div>
            <div className="text-xs text-gray-500 bg-club-bg border border-club-border rounded px-3 py-1.5">
              High-res photos available
            </div>
            <div className="text-xs text-gray-500 bg-club-bg border border-club-border rounded px-3 py-1.5">
              Founder interviews welcome
            </div>
          </div>
        </div>

        {/* Press quotes */}
        <div className="mb-10">
          <h2
            className="text-lg font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            As Seen In
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pressFeatures.map((feature) => (
              <div
                key={feature.outlet}
                className="bg-club-card border border-club-border rounded-lg p-6 text-center"
              >
                <p className="text-gray-400 text-sm italic mb-3">&ldquo;{feature.quote}&rdquo;</p>
                <p className="text-club-gold text-xs font-semibold uppercase tracking-wide">
                  &mdash; {feature.outlet}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-10">
          <h2
            className="text-lg font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Gallery
          </h2>
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryImages.map((img) => (
                <div
                  key={img.id}
                  className="aspect-[4/3] bg-club-card border border-club-border rounded-lg overflow-hidden relative group"
                >
                  <Image
                    src={img.image_url}
                    alt={img.caption ?? "Mad Hatter Comedy Club"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-club-card border border-club-border rounded-lg">
              <div className="text-4xl opacity-20 mb-3">📷</div>
              <p className="text-gray-600 text-sm">Gallery photos coming soon.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Want to feature Mad Hatter in your publication?</p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-club-red text-white font-bold rounded hover:bg-red-700 transition-colors"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
