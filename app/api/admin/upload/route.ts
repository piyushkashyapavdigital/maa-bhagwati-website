import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabase, BUCKET, publicUrl } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({ success: true, ok: true });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0)
      return NextResponse.json({ error: 'Missing file field "file"' }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowedExts = ["png", "jpg", "jpeg", "webp", "gif"];
    if (!allowedExts.includes(ext))
      return NextResponse.json({ error: "Only PNG/JPG/WEBP/GIF allowed" }, { status: 400 });

    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `uploads/${name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { contentType: file.type });

    if (error) return NextResponse.json({ error: `Supabase upload failed: ${error.message}` }, { status: 500 });

    const url = publicUrl(filePath);
    return NextResponse.json({ success: true, path: url, url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
