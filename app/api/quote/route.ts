import { NextRequest, NextResponse } from "next/server";
import { quoteCart } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lines = Array.isArray(body?.items) ? body.items : [];

    const quote = await quoteCart(
      lines
        .filter(
          (l: unknown): l is { productId: string; quantity: number } =>
            typeof l === "object" &&
            l !== null &&
            typeof (l as { productId?: unknown }).productId === "string" &&
            Number.isFinite(Number((l as { quantity?: unknown }).quantity))
        )
        .map((l: { productId: string; quantity: number }) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
        }))
    );

    return NextResponse.json({ success: true, quote });
  } catch (err) {
    console.error("Quote error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
