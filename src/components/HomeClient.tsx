"use client";

import { useState } from "react";
import Link from "next/link";
import EmailPopup from "@/components/EmailPopup";

export default function HomeClient({ background }: { background: string }) {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <>
      {/* Full-screen background — uses admin-uploaded image for both mobile and desktop */}
      <div
        className="fixed inset-0 cursor-pointer"
        style={{
          backgroundImage: `url('${background}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#000",
        }}
        onClick={() => setPopupOpen(true)}
      />

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
