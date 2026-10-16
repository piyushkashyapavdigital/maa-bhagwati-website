import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabase, BUCKET, publicUrl } from "@/lib/supabase";

const ALLOWED_EXTS = ["png", "jpg", "jpeg", "webp", "gif"];

/**
 * Keep the uploaded file's own name as its storage id (no timestamps or
 * random suffixes). Only make it safe for a URL: drop any folder prefix,
 * turn whitespace into "-", and replace unsafe characters.
 */
function safeFileName(rawName: string, ext: string): string {
  const base = rawName
    .replace(/^.*[\\/]/, "") // drop any folder prefix
    .replace(/\.[^.]*$/, "") // drop the old extension
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .slice(0, 80);
  return `${base || "image"}.${ext}`;
}

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
    if (!ALLOWED_EXTS.includes(ext))
      return NextResponse.json({ error: "Only PNG/JPG/WEBP/GIF allowed" }, { status: 400 });

    // The uploaded name *is* the id — no timestamp/random suffix.
    const name = safeFileName(file.name, ext);
    const filePath = `uploads/${name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (error) return NextResponse.json({ error: `Supabase upload failed: ${error.message}` }, { status: 500 });

    const url = publicUrl(filePath);
    return NextResponse.json({ success: true, name, path: url, url }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
