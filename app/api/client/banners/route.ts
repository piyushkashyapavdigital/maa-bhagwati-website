import { NextResponse } from "next/server";
import { getBanners } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public banners for the client shopping app (same as admin manages).
export async function GET() {
  const banners = await getBanners();
  return NextResponse.json({ success: true, total: banners.length, banners });
}
