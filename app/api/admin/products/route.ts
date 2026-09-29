import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ success: true, total: products.length, products });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const product = await createProduct(body);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/products failed:", e);
    const detail = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: `Bad request: ${detail}` }, { status: 400 });
  }
}
