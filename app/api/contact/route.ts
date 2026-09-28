import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const MSG_FILE = path.join(process.cwd(), "data", "contact-messages.json");

function readMessages(): unknown[] {
  if (!fs.existsSync(MSG_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(MSG_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const message = String(body?.message ?? "").trim();

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Name, phone, and message are required." },
        { status: 400 }
      );
    }

    const messages = readMessages();
    messages.push({
      id: `msg-${Date.now()}`,
      name,
      phone,
      message,
      createdAt: new Date().toISOString(),
    });
    fs.mkdirSync(path.dirname(MSG_FILE), { recursive: true });
    fs.writeFileSync(MSG_FILE, JSON.stringify(messages, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}