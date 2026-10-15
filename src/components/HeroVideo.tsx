"use client";

type HeroVideoProps = {
  videoUrl: string;
  videoType: "upload" | "youtube" | "vimeo";
};

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?\s]+)/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

export default function HeroVideo({ videoUrl, videoType }: HeroVideoProps) {
  if (videoType === "upload") {
    return (
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  if (videoType === "youtube") {
    const id = getYouTubeId(videoUrl);
    if (!id) return null;
    return (
      <iframe
        src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen"
        title="Hero video"
      />
    );
  }

  if (videoType === "vimeo") {
    const id = getVimeoId(videoUrl);
    if (!id) return null;
    return (
      <iframe
        src={`https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1&playsinline=1`}
        className="absolute inset-0 w-full h-full border-0"
        allow="autoplay; fullscreen"
        title="Hero video"
      />
    );
  }

  return null;
}
