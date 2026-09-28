import { ApiError } from "./errors";

export function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,x-admin-token",
  };
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new ApiError(400, "Body must be a JSON object");
    }
    return data as Record<string, unknown>;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(400, "Invalid JSON body");
  }
}
