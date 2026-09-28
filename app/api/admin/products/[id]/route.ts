import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const product = db.products.find((p) => p.id === id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ success: true, product });
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
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    db.products[idx] = { ...db.products[idx], ...body };
    writeDb(db);
    return NextResponse.json({ success: true, product: db.products[idx] });
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
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  db.products.splice(idx, 1);
  writeDb(db);
  return NextResponse.json({ success: true });
}
