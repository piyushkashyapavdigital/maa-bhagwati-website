import { NextRequest, NextResponse } from "next/server";
import { computeStats } from "@/lib/db";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? undefined;
  const to = req.nextUrl.searchParams.get("to") ?? undefined;
  const stats = await computeStats(from, to);
  return NextResponse.json({ success: true, stats });
}
