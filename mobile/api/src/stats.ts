import { readDb } from "./db";
import { readOrders, ORDER_STATUSES } from "./orders";
import { readMessages } from "./messages";
import type { OrderStatus } from "./types";

export interface StatsPayload {
  generatedAt: string;
  totals: {
    revenue: number;
    orders: number;
    activeProducts: number;
    products: number;
    categories: number;
    customers: number;
    unreadMessages: number;
  };
  ordersByStatus: Record<string, number>;
  revenueSeries: { date: string; revenue: number; orders: number }[];
  topProducts: {
    id: string;
    name: string;
    emoji: string;
    qty: number;
    revenue: number;
  }[];
  categoryRevenue: { categoryId: string; name: string; revenue: number }[];
  lowStock: {
    id: string;
    name: string;
    emoji: string;
    stock: number;
    unit: string;
  }[];
  recentOrders: {
    id: string;
    total: number;
    status: string;
    date: string;
    customerName: string;
    itemsCount: number;
  }[];
}

const DAY_MS = 86_400_000;
const SERIES_DAYS = 14;

/** Revenue/top-products/category metrics exclude Failed orders. */
export function computeStats(from?: string, to?: string): StatsPayload {
  const db = readDb();
  const allOrders = readOrders();
  const orders = allOrders.filter((o) => o.status !== "Failed");

  // Date range filter
  const fromDate = from ? new Date(from + "T00:00:00.000Z").getTime() : null;
  const toDate = to ? new Date(to + "T23:59:59.999Z").getTime() : null;

  const inRange = (dateStr: string) => {
    const t = new Date(dateStr).getTime();
    if (fromDate && t < fromDate) return false;
    if (toDate && t > toDate) return false;
    return true;
  };

  const filteredOrders = orders.filter((o) => inRange(o.date));
  const filteredAllOrders = allOrders.filter((o) => inRange(o.date));

  const revenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
  const customers = new Set(
    filteredAllOrders.map((o) => o.customer.phone).filter(Boolean)
  ).size;

  const ordersByStatus: Record<string, number> = {};
  for (const status of ORDER_STATUSES) ordersByStatus[status] = 0;
  for (const o of filteredAllOrders) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
  }

  // Revenue series for the selected range (or last 14 days if no range)
  const bucket = new Map<string, { revenue: number; orders: number }>();
  for (const o of filteredOrders) {
    const key = o.date.slice(0, 10);
    const cur = bucket.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.total;
    cur.orders += 1;
    bucket.set(key, cur);
  }
  const revenueSeries: StatsPayload["revenueSeries"] = [];
  const now = Date.now();
  const days = fromDate && toDate
    ? Math.min(365, Math.max(1, Math.ceil((toDate - fromDate) / DAY_MS) + 1))
    : SERIES_DAYS;
  const start = fromDate
    ? new Date(fromDate).toISOString().slice(0, 10)
    : new Date(now - (days - 1) * DAY_MS).toISOString().slice(0, 10);
  for (let i = 0; i < days; i++) {
    const date = new Date(new Date(start).getTime() + i * DAY_MS).toISOString().slice(0, 10);
    const v = bucket.get(date) ?? { revenue: 0, orders: 0 };
    revenueSeries.push({ date, revenue: v.revenue, orders: v.orders });
  }

  // Top products by qty (non-failed orders)
  const productById = new Map(db.products.map((p) => [p.id, p]));
  const agg = new Map<
    string,
    { id: string; name: string; emoji: string; qty: number; revenue: number }
  >();
  for (const o of orders) {
    for (const item of o.items) {
      const p = productById.get(item.id);
      const cur = agg.get(item.id) ?? {
        id: item.id,
        name: p?.name ?? item.name,
        emoji: p?.emoji ?? "🪔",
        qty: 0,
        revenue: 0,
      };
      cur.qty += item.qty;
      cur.revenue += item.price * item.qty;
      agg.set(item.id, cur);
    }
  }
  const topProducts = [...agg.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Category revenue split (non-failed, snapshot prices)
  const catRevenue = new Map<string, number>();
  for (const o of orders) {
    for (const item of o.items) {
      const p = productById.get(item.id);
      const cid = p?.categoryId ?? "uncategorized";
      catRevenue.set(cid, (catRevenue.get(cid) ?? 0) + item.price * item.qty);
    }
  }
  const catById = new Map(db.categories.map((c) => [c.id, c.name]));
  const categoryRevenue = [...catRevenue.entries()]
    .map(([categoryId, rev]) => ({
      categoryId,
      name:
        catById.get(categoryId) ??
        (categoryId === "uncategorized" ? "Uncategorized" : categoryId),
      revenue: rev,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const lowStock = db.products
    .filter((p) => p.isActive && p.stock <= 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      stock: p.stock,
      unit: p.unit,
    }));

  const recentOrders = [...allOrders]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      total: o.total,
      status: o.status as OrderStatus,
      date: o.date,
      customerName: o.customer.name,
      itemsCount: o.items.reduce((s, i) => s + i.qty, 0),
    }));

  const unreadMessages = readMessages().filter((m) => !m.read).length;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      revenue,
      orders: allOrders.length,
      activeProducts: db.products.filter((p) => p.isActive).length,
      products: db.products.length,
      categories: db.categories.length,
      customers,
      unreadMessages,
    },
    ordersByStatus,
    revenueSeries,
    topProducts,
    categoryRevenue,
    lowStock,
    recentOrders,
  };
}
