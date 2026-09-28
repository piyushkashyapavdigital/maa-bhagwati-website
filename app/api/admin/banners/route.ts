import { NextRequest, NextResponse } from "next/server";
import { getBanners, createBanner } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const banners = await getBanners();
  return NextResponse.json({ success: true, banners });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const banner = await createBanner(body);
    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
