import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import AdminContent from "@/components/admin/AdminContent";
import AdminProviders from "@/components/admin/AdminProviders";

export const metadata: Metadata = {
  title: "Admin | Mad Hatter Comedy Club",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <div className="min-h-screen bg-off-white flex">
        <AdminNav />
        <AdminContent>{children}</AdminContent>
      </div>
    </AdminProviders>
  );
}
