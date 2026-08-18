export const dynamic = "force-dynamic";

import { getAdminClient } from "@/lib/supabase";
import type { Order } from "@/lib/supabase";

async function getOrders(): Promise<Order[]> {
  const db = getAdminClient();
  const { data } = await db
    .from("orders")
    .select("*, events(title, date)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount_cents, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-charcoal font-display">
            Orders
          </h1>
          {completedOrders.length > 0 && (
            <p className="text-sm text-muted mt-1">
              {completedOrders.length} completed — ${(totalRevenue / 100).toFixed(2)} total revenue
            </p>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-muted">No orders yet.</div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const eventTitle = order.events?.title ?? "Unknown Event";
            const amount = `$${(order.amount_cents / 100).toFixed(2)}`;
            const date = new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className="flex items-center justify-between bg-white border border-charcoal/10 px-5 py-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-charcoal truncate">{eventTitle}</div>
                    <div className="text-xs text-muted">
                      {order.email} — {order.quantity} ticket{order.quantity > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-charcoal">{amount}</span>
                  <span
                    className={`text-xs px-2 py-0.5 ${
                      order.status === "completed"
                        ? "bg-green-50 text-green-700"
                        : order.status === "pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : order.status === "refunded"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-muted">{date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
