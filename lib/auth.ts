import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function adminToken(): string {
  return process.env.ADMIN_TOKEN?.trim() ?? "";
}

/** Returns a 401 response when the request is not allowed, else null. */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const expected = adminToken();
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not configured" },
      { status: 500 }
    );
  }
  const token = req.headers.get("x-admin-token");
  if (token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  return null;
}
