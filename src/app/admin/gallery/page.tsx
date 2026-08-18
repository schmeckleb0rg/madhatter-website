export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { GalleryImage } from "@/lib/supabase";
import GalleryUploadForm from "./GalleryUploadForm";
import DeleteGalleryButton from "./DeleteGalleryButton";
import Image from "next/image";

async function getImages(): Promise<GalleryImage[]> {
  const db = getAdminClient();
  const { data } = await db.from("gallery_images").select("*").order("sort_order", { ascending: true });
  return (data as GalleryImage[]) ?? [];
}

export default async function AdminGalleryPage() {
  const images = await getImages();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-charcoal font-display">
            Gallery
          </h1>
          <p className="text-sm text-muted mt-1">{images.length} image{images.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white border border-charcoal/10 p-6 mb-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted mb-4">Upload New Image</h2>
        <GalleryUploadForm />
      </div>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="text-center py-20 text-muted">No gallery images yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white border border-charcoal/10 overflow-hidden group relative">
              <div className="aspect-[4/3] relative">
                <Image
                  src={img.image_url}
                  alt={img.caption ?? "Gallery image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              <div className="p-3 flex items-center justify-between">
                <p className="text-xs text-muted truncate">{img.caption ?? "No caption"}</p>
                <DeleteGalleryButton id={img.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
