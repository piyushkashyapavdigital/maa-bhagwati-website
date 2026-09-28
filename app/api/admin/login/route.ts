import { NextRequest, NextResponse } from "next/server";
import { adminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body["token"] ?? "");
    const expected = adminToken();
    if (!expected) return NextResponse.json({ error: "ADMIN_TOKEN not configured" }, { status: 500 });
    if (token !== expected) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
