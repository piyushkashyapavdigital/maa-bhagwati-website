import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const db = readDb();
  const categories = db.categories.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  return NextResponse.json({ success: true, categories });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const db = readDb();
    const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const category = { ...body, id };
    db.categories.push(category);
    writeDb(db);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
