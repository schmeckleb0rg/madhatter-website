"use client";

import { useState } from "react";
import Link from "next/link";
import EmailPopup from "@/components/EmailPopup";

export default function HomeClient({ background }: { background: string }) {
  const [popupOpen, setPopupOpen] = useState(false);

  const bgStyle = {
    position: "fixed" as const,
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#000",
  };

  return (
    <>
      {/* Mobile */}
      <div
        className="sm:hidden"
        style={{ ...bgStyle, backgroundImage: "url('/Mad%20Hatter_mobilebackgroung.png')" }}
        onClick={() => setPopupOpen(true)}
      />
      {/* Desktop */}
      <div
        className="hidden sm:block cursor-pointer"
        style={{ ...bgStyle, backgroundImage: `url('${background}')` }}
        onClick={() => setPopupOpen(true)}
      />

      {/* Hidden access link */}
      <Link
        href="/about"
        aria-label="View site"
        className="fixed bottom-4 left-4 z-50 block h-[18px] w-[18px] rounded opacity-0 transition-opacity duration-200 hover:opacity-15 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#B8934A]"
      />

      {/* Email popup */}
      <EmailPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </>
  );
}
