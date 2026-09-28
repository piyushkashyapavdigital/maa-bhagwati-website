import { NextRequest, NextResponse } from "next/server";
import { readMessages } from "@/lib/data";

export async function GET() {
  const messages = readMessages().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ success: true, total: messages.length, messages });
}
