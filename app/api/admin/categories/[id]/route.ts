import { NextRequest, NextResponse } from "next/server";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = await getCategoryById(id);
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
    const category = await updateCategory(id, body);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    return NextResponse.json({ success: true, category });
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
  const ok = await deleteCategory(id);
  if (!ok) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
