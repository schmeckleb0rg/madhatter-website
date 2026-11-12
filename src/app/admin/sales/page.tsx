export const dynamic = "force-dynamic";

import SalesClient from "@/components/admin/SalesClient";

export default function AdminSalesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-charcoal font-display">Sales</h1>
        <p className="text-sm text-muted mt-1">Revenue metrics across tickets, merch, and gift cards.</p>
      </div>
      <SalesClient />
    </div>
  );
}
