import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Client-app contact form → Supabase so the admin app sees it.
// (Website form writes to a local file; this one feeds the admin inbox.)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const message = String(body?.message ?? "").trim();
    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Name, phone and message are required." }, { status: 400 });
    }
    const { error } = await supabase.from("contact_messages").insert({
      id: `msg-${Date.now()}`,
      name,
      phone,
      message,
      read: false,
    });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Client contact error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
