import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const category = db.categories.find((c) => c.id === id);
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json({ success: true, category });
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
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    db.categories[idx] = { ...db.categories[idx], ...body };
    writeDb(db);
    return NextResponse.json({ success: true, category: db.categories[idx] });
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
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  db.categories.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ success: true });
}
