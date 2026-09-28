import { NextResponse } from "next/server";
import { getCategories } from "@/lib/db";

export async function GET() {
  const categories = getCategories();
  return NextResponse.json({
    success: true,
    total: categories.length,
    categories,
  });
}
