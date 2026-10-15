"use client";

type VideoItem = {
  title: string;
  url: string;
  thumbnail_url?: string;
};

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?\s]+)/);
  return match ? match[1] : null;
}

export default function VideoReel({ items }: { items: VideoItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="bg-charcoal dark:bg-[#080706] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-mono text-xs tracking-widest uppercase text-gold mb-6 text-center">
          From The Stage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.slice(0, 3).map((item, i) => {
            const ytId = getYouTubeId(item.url);
            return (
              <div key={i} className="aspect-video bg-black overflow-hidden">
                {ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                    className="w-full h-full border-0"
                    allow="fullscreen"
                    title={item.title}
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                    poster={item.thumbnail_url}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
