import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readMessages, markMessageRead } from "@/lib/data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = readMessages();
  const message = messages.find((m) => m.id === id);
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  return NextResponse.json({ success: true, message });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const { id } = await params;
  const message = markMessageRead(id);
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  return NextResponse.json({ success: true, message });
}
