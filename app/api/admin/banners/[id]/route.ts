import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const banner = db.banners.find((b) => b.id === id);
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
    const db = readDb();
    const idx = db.banners.findIndex((b) => b.id === id);
    if (idx === -1) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    db.banners[idx] = { ...db.banners[idx], ...body };
    writeDb(db);
    return NextResponse.json({ success: true, banner: db.banners[idx] });
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
  const db = readDb();
  const idx = db.banners.findIndex((b) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: "Banner not found" }, { status: 404 });
  db.banners.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ success: true });
}
