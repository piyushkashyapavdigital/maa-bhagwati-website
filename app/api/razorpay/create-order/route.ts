import { NextRequest, NextResponse } from "next/server";
import {
  OrderCustomer,
  OrderItem,
  readOrders,
  writeOrders,
} from "@/lib/orders";
import { quoteCart } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const {
      customer, // { name, phone, email, address1, ... } from checkout form
      items, // [{ productId, quantity }] — NEVER amounts
    } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ── Recompute the entire total from the database. ──
    // Any amount sent from the frontend is ignored.
    const quote = quoteCart(items);
    if (quote.items.length === 0 || quote.total < 1) {
      return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(quote.total * 100), // paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Razorpay order creation failed:", error);
      return NextResponse.json(
        { error: "Failed to create Razorpay order", details: error },
        { status: response.status }
      );
    }

    const order = await response.json();

    // ── Save a Pending order so the owner sees abandoned checkouts ──
    if (customer?.name) {
      const orders = readOrders();
      const orderItems: OrderItem[] = quote.items.map((i) => ({
        id: i.productId,
        name: i.name,
        image: i.image ?? undefined,
        price: i.price,
        qty: i.quantity,
      }));
      orders.unshift({
        id: order.id,
        rzpOrderId: order.id,
        date: new Date().toISOString(),
        status: "Pending",
        customer: customer as OrderCustomer,
        items: orderItems,
        subtotal: quote.subtotal,
        deliveryCharge: quote.deliveryCharge,
        total: quote.total,
      });
      writeOrders(orders);
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      quote,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
