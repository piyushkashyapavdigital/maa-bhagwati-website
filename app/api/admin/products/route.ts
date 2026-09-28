import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const db = readDb();
  const products = db.products.filter((p) => p.isActive);
  return NextResponse.json({ success: true, total: products.length, products });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const db = readDb();
    const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const product = { ...body, id };
    db.products.push(product);
    writeDb(db);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
