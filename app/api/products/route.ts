import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const products = getProducts(categoryId);
  return NextResponse.json({
    success: true,
    total: products.length,
    products,
  });
}
