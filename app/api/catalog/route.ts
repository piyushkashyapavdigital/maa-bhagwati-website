import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { categories, products } = await getCatalog();
  return NextResponse.json({
    success: true,
    total: products.length,
    categories,
    products,
  });
}
