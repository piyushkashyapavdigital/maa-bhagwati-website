import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";
import { customerTopic, sendPush } from "@/lib/push";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ success: true, order });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const status = (await req.json()).status;
  if (typeof status !== "string")
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  const order = await updateOrderStatus(id, status);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const uid = (order as any)?.user_id;
  if (uid && status !== "Failed") {
    await sendPush(
      customerTopic(uid),
      `Order ${status} 📦`,
      `Order ${String(id).slice(-8)} is now ${status}`,
      { type: "order", id: String(id) }
    );
  }
  return NextResponse.json({ success: true, order });
}
