import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const products = await getProducts(categoryId);
  return NextResponse.json({
    success: true,
    total: products.length,
    products,
  });
}
