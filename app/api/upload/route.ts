import { NextRequest, NextResponse } from "next/server";
import { supabase, BUCKET, publicUrl } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const segments = req.nextUrl.pathname.replace("/api/upload/", "").split("/");
  const name = segments.join("/");
  if (!name || name.includes("..") || segments.length !== 1)
    return NextResponse.json({ error: "Bad path" }, { status: 400 });

  const url = publicUrl(`uploads/${name}`);
  return NextResponse.redirect(url, 302);
}
