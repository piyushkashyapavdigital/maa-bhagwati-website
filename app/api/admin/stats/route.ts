import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { readOrders } from "@/lib/data";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? undefined;
  const to = req.nextUrl.searchParams.get("to") ?? undefined;

  const db = readDb();
  const allOrders = readOrders();
  const DAY_MS = 86_400_000;

  const filteredOrders = allOrders.filter((o: any) => {
    if (o.status === "Failed") return false;
    const t = new Date(o.date).getTime();
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to).getTime() + DAY_MS) return false;
    return true;
  });

  const revenue = filteredOrders.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);
  const ordersByStatus: Record<string, number> = {};
  for (const o of allOrders) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
  }

  const bucket = new Map<string, { revenue: number; orders: number }>();
  for (const o of filteredOrders) {
    const key = o.date.slice(0, 10);
    const cur = bucket.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(o.total);
    cur.orders += 1;
    bucket.set(key, cur);
  }

  const days = from && to
    ? Math.min(365, Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS) + 1))
    : 14;

  const start = from
    ? new Date(from).toISOString().slice(0, 10)
    : new Date(Date.now() - (days - 1) * DAY_MS).toISOString().slice(0, 10);

  const revenueSeries = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(new Date(start).getTime() + i * DAY_MS).toISOString().slice(0, 10);
    const v = bucket.get(date) ?? { revenue: 0, orders: 0 };
    revenueSeries.push({ date, revenue: v.revenue, orders: v.orders });
  }

  const recentOrders = allOrders
    .filter((o: any) => o.status !== "Failed")
    .sort((a: any, b: any) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((o: any) => ({ id: o.id, date: o.date, total: o.total, status: o.status }));

  return NextResponse.json({
    success: true,
    stats: {
      revenue,
      orders: allOrders.length,
      ordersByStatus,
      revenueSeries,
      topProducts: [],
      categoryRevenue: [],
      lowStock: [],
      recentOrders,
      totals: {
        revenue,
        orders: allOrders.length,
        activeProducts: db.products.filter((p) => p.isActive).length,
        products: db.products.length,
        categories: db.categories.length,
        customers: 0,
        unreadMessages: 0,
      },
    },
  });
}
