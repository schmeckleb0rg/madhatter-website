"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EmailPopup from "@/components/EmailPopup";
import HeroVideo from "@/components/HeroVideo";

type HomeClientProps = {
  background: string;
  mobileBackground: string | null;
  heroVideoUrl: string | null;
  heroVideoType: "upload" | "youtube" | "vimeo" | "none";
};

export default function HomeClient({ background, mobileBackground, heroVideoUrl, heroVideoType }: HomeClientProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const bgImage = isMobile && mobileBackground ? mobileBackground : background;
  const showVideo = heroVideoUrl && heroVideoType !== "none";

  return (
    <>
      {/* Full-screen background — video or image */}
      <div
        className="fixed inset-0 cursor-pointer overflow-hidden"
        style={{
          backgroundColor: "#000",
          ...(!showVideo ? {
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          } : {}),
        }}
        onClick={() => setPopupOpen(true)}
      >
        {showVideo && (
          <HeroVideo videoUrl={heroVideoUrl} videoType={heroVideoType} />
        )}
      </div>

      {/* Hidden access link — larger touch target on mobile */}
      <Link
        href="/about"
        aria-label="View site"
        className="fixed bottom-4 left-4 z-50 block w-11 h-11 rounded opacity-0 transition-opacity duration-200 hover:opacity-15 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#B8934A]"
      />

      {/* Email popup */}
      <EmailPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </>
  );
}
