import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { readOrders, writeOrders } from "@/lib/orders";
import { quoteCart } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items, // [{ productId, quantity }] for a fresh server-side quote
    } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Secret not configured" }, { status: 500 });
    }

    // Verify HMAC signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest("hex");

    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Re-quote from the DB so the authoritative amounts come from the server
    const quote = quoteCart(Array.isArray(items) ? items : []);

    // ── Mark the order Confirmed in the owner's records ──
    const orders = readOrders();
    const dbOrder = orders.find((o) => o.id === razorpay_order_id);
    if (dbOrder) {
      dbOrder.status = "Confirmed";
      dbOrder.paymentId = razorpay_payment_id;
      if (quote.items.length > 0) {
        dbOrder.items = quote.items.map((i) => ({
          id: i.productId,
          name: i.name,
          image: i.image ?? undefined,
          price: i.price,
          qty: i.quantity,
        }));
        dbOrder.subtotal = quote.subtotal;
        dbOrder.deliveryCharge = quote.deliveryCharge;
        dbOrder.total = quote.total;
      }
      writeOrders(orders);
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      message: "Payment verified successfully",
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
