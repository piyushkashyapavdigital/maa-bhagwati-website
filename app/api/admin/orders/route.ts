import { NextRequest, NextResponse } from "next/server";
import { readOrders } from "@/lib/db";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const orders = await readOrders();
  const filtered = status ? orders.filter((o: any) => o.status === status) : orders;
  const sorted = [...filtered].sort((a: any, b: any) => b.date.localeCompare(a.date));
  return NextResponse.json({ success: true, total: sorted.length, orders: sorted });
}
