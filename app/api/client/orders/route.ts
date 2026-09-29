import { NextRequest, NextResponse } from "next/server";
import { getOrdersByUserId } from "@/lib/db";
import { getClientUserId } from "../_auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Client-app order history — only the logged-in user's orders.
export async function GET(req: NextRequest) {
  const userId = await getClientUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const orders = await getOrdersByUserId(userId);
  return NextResponse.json({ success: true, total: orders.length, orders });
}
