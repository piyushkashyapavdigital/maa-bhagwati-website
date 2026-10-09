import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrderStatus, quoteCart } from "@/lib/db";
import { customerTopic, sendPush } from "@/lib/push";

const numOrNull = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, lat, lng } = await req.json();
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return NextResponse.json({ error: "Secret not configured" }, { status: 500 });

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest("hex");
    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const quote = await quoteCart(Array.isArray(items) ? items : [], {
      lat: numOrNull(lat),
      lng: numOrNull(lng),
    });
    const updated: any = await updateOrderStatus(razorpay_order_id, "Confirmed");
    // Notify the buyer (client app registers customer:<userId> on login).
    const uid = updated?.user_id;
    if (uid) {
      await sendPush(
        customerTopic(uid),
        "Payment confirmed ✅",
        `Order ${String(razorpay_order_id).slice(-8)} · ₹${quote.total}`,
        { type: "order", id: String(razorpay_order_id) }
      );
    }

    return NextResponse.json({ success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id, message: "Payment verified successfully" });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
