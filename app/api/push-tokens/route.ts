import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Client/admin apps register their FCM token here after login.
// Body: { token, topic } — topic 'admin' for shop-owner phones,
// 'customer:<userId>' for buyer order updates.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body?.token ?? "").trim();
    const topic = String(body?.topic ?? "admin").trim();
    if (!token || token.length < 20) {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }
    const { error } = await supabase
      .from("push_tokens")
      .upsert({ token, topic, platform: "android" }, { onConflict: "token" });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("push-tokens error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
