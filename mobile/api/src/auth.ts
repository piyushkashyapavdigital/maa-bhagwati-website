import { json } from "./http";

export function adminToken(): string {
  return process.env.ADMIN_TOKEN?.trim() ?? "";
}

/** Returns a 401/500 Response when the request is not allowed, else null. */
export function requireAdmin(req: Request): Response | null {
  const expected = adminToken();
  if (!expected) {
    return json(
      { error: "ADMIN_TOKEN not configured on server" },
      500
    );
  }
  const provided = req.headers.get("x-admin-token") ?? "";
  if (!provided || provided !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}
