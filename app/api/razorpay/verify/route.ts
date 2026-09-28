import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus, quoteCart } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items } = await req.json();
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return NextResponse.json({ error: "Secret not configured" }, { status: 500 });

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest("hex");
    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const quote = await quoteCart(Array.isArray(items) ? items : []);
    await updateOrderStatus(razorpay_order_id, "Confirmed");

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id, message: "Payment verified successfully" });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
