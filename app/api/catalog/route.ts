import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/db";

export async function GET() {
  const { categories, products } = getCatalog();
  return NextResponse.json({
    success: true,
    total: products.length,
    categories,
    products,
  });
}
