import { NextRequest, NextResponse } from "next/server";
import { createClientOrder, quoteCart } from "@/lib/db";
import { getClientUserId } from "../_auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Client-app checkout: same server-side repricing as the website,
// plus the order is linked to the logged-in Supabase user (when present).
export async function POST(req: NextRequest) {
  try {
    const { customer, items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    const quote = await quoteCart(items);
    if (quote.items.length === 0 || quote.total < 1) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
    }
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(quote.total * 100), currency: "INR", receipt: `app_${Date.now()}` }),
    });
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: "Failed to create Razorpay order", details: error }, { status: response.status });
    }
    const order = await response.json();
    const userId = await getClientUserId(req);
    if (customer?.name) {
      const orderItems = quote.items.map((i: any) => ({ id: i.productId, name: i.name, image: i.image ?? undefined, price: i.price, qty: i.quantity }));
      await createClientOrder(userId ?? "", {
        id: order.id, rzpOrderId: order.id, date: new Date().toISOString(), status: "Pending",
        customer, items: orderItems, subtotal: quote.subtotal, deliveryCharge: quote.deliveryCharge, total: quote.total,
      });
    }
    return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency, quote });
  } catch (err) {
    console.error("Client create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
