import { NextRequest, NextResponse } from "next/server";
import { getBannerById, updateBanner, deleteBanner } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const banner = await getBannerById(id);
  if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  return NextResponse.json({ success: true, banner });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const body = await req.json();
    const banner = await updateBanner(id, body);
    if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    return NextResponse.json({ success: true, banner });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  const ok = await deleteBanner(id);
  if (!ok) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
