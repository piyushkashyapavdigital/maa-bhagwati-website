import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readOrders } from "@/lib/data";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const db = readDb();
  const orders = readOrders();
  const filtered = status ? orders.filter((o) => o.status === status) : orders;
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  return NextResponse.json({ success: true, total: sorted.length, orders: sorted });
}
