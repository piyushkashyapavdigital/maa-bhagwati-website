import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ success: true, categories });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const category = await createCategory(body);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
