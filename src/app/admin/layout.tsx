import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import AdminProviders from "@/components/admin/AdminProviders";

export const metadata: Metadata = {
  title: "Admin | Mad Hatter Comedy Club",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="min-h-screen bg-off-white">
        <AdminNav />
        <div className="pt-16">{children}</div>
      </div>
    </AdminProviders>
  );
}
