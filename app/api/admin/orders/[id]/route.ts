import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readOrders, updateOrderStatus } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orders = readOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ success: true, order });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await params;
  try {
    const body = await req.json();
    const status = body["status"];
    if (typeof status !== "string")
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    const order = updateOrderStatus(id, status);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true, order });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
