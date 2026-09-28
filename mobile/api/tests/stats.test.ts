import { describe, test, expect, beforeAll } from "bun:test";
import { setupDataDir } from "./helpers";
import { computeStats } from "../src/stats";
import { updateOrderStatus } from "../src/orders";

beforeAll(() => {
  setupDataDir();
});

describe("computeStats", () => {
  test("revenue excludes Failed orders (60 + 315 = 375)", () => {
    const s = computeStats();
    expect(s.totals.revenue).toBe(375);
  });

  test("counts: 3 orders total, 2 customers, fixture catalog", () => {
    const s = computeStats();
    expect(s.totals.orders).toBe(3);
    expect(s.totals.customers).toBe(2); // 9000000001 twice + 9000000002
    expect(s.totals.products).toBe(3);
    expect(s.totals.activeProducts).toBe(2); // prod-3 inactive
    expect(s.totals.categories).toBe(2);
    expect(s.totals.unreadMessages).toBe(1); // msg-1 unread, msg-2 read
  });

  test("ordersByStatus breakdown", () => {
    const s = computeStats();
    expect(s.ordersByStatus["Confirmed"]).toBe(2);
    expect(s.ordersByStatus["Failed"]).toBe(1);
    expect(s.ordersByStatus["Pending"]).toBe(0);
  });

  test("14-day series: today=60, 3-days-ago=315", () => {
    const s = computeStats();
    expect(s.revenueSeries.length).toBe(14);

    const today = new Date().toISOString().slice(0, 10);
    const threeAgo = new Date(Date.now() - 3 * 86_400_000)
      .toISOString()
      .slice(0, 10);

    const todayBucket = s.revenueSeries.find((d) => d.date === today);
    expect(todayBucket?.revenue).toBe(60);
    expect(todayBucket?.orders).toBe(1); // failed excluded

    const oldBucket = s.revenueSeries.find((d) => d.date === threeAgo);
    expect(oldBucket?.revenue).toBe(315);
    expect(oldBucket?.orders).toBe(1);
  });

  test("top products: Jau (5) above Roli (2), failed Loban excluded", () => {
    const s = computeStats();
    expect(s.topProducts[0]?.id).toBe("prod-2");
    expect(s.topProducts[0]?.qty).toBe(5);
    expect(s.topProducts[0]?.revenue).toBe(245);
    expect(s.topProducts[1]?.id).toBe("prod-1");
    expect(s.topProducts[1]?.qty).toBe(2);
    expect(s.topProducts.some((p) => p.id === "prod-3")).toBe(false);
  });

  test("category revenue split: cat-1=60, cat-2=245", () => {
    const s = computeStats();
    const cat1 = s.categoryRevenue.find((c) => c.categoryId === "cat-1");
    const cat2 = s.categoryRevenue.find((c) => c.categoryId === "cat-2");
    expect(cat1?.revenue).toBe(60);
    expect(cat2?.revenue).toBe(245);
  });

  test("low stock: only active prod-2 (stock 3), inactive prod-3 excluded", () => {
    const s = computeStats();
    expect(s.lowStock.length).toBe(1);
    expect(s.lowStock[0]?.id).toBe("prod-2");
    expect(s.lowStock[0]?.stock).toBe(3);
  });

  test("recent orders sorted desc, capped at 5", () => {
    const s = computeStats();
    expect(s.recentOrders.length).toBe(3);
    const dates = s.recentOrders.map((o) => o.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });
});

describe("order status updates affect stats", () => {
  test("marking failed order Confirmed adds its revenue", () => {
    updateOrderStatus("pay_failed", "Confirmed");
    const s = computeStats();
    expect(s.totals.revenue).toBe(375 + 999);
    expect(s.ordersByStatus["Confirmed"]).toBe(3);
    expect(s.ordersByStatus["Failed"]).toBe(0);

    // revert
    updateOrderStatus("pay_failed", "Failed");
    const after = computeStats();
    expect(after.totals.revenue).toBe(375);
  });
});
