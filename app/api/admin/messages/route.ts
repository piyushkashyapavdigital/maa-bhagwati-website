import { NextRequest, NextResponse } from "next/server";
import { readMessages } from "@/lib/db";

export async function GET() {
  const messages = await readMessages();
  return NextResponse.json({ success: true, total: messages.length, messages });
}
