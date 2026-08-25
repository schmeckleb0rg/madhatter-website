"use client";

import { usePathname } from "next/navigation";

export default function AdminContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <main className={`flex-1 min-w-0 ${isLoginPage ? "" : "ml-56"}`}>
      {children}
    </main>
  );
}
