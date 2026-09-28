import fs from "node:fs";
import path from "node:path";
import { ApiError } from "./errors";
import { corsHeaders, json, readJson } from "./http";
import { adminToken, requireAdmin } from "./auth";
import {
  readDb,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createBanner,
  updateBanner,
  deleteBanner,
} from "./db";
import { readOrders, updateOrderStatus } from "./orders";
import { readMessages, markMessageRead } from "./messages";
import { computeStats } from "./stats";
import { uploadsDir } from "./paths";
import { supabase, BUCKET, publicUrl } from "./supabase";

const IMAGE_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "gif"];

async function login(req: Request): Promise<Response> {
  const body = await readJson(req);
  const token = String(body["token"] ?? "");
  const expected = adminToken();
  if (!expected) throw new ApiError(500, "ADMIN_TOKEN not configured");
  if (token !== expected) throw new ApiError(401, "Invalid token");
  return json({ success: true });
}

async function upload(req: Request): Promise<Response> {
  const form = await req.formData().catch(() => null);
  if (!form) throw new ApiError(400, "Expected multipart/form-data");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0)
    throw new ApiError(400, 'Missing file field "file"');

  let ext = IMAGE_MIME[file.type] ?? null;
  if (!ext && file.name.includes(".")) {
    const raw = file.name.split(".").pop()!.toLowerCase();
    if (IMAGE_EXTS.includes(raw)) ext = raw === "jpeg" ? "jpg" : raw;
  }
  if (!ext) throw new ApiError(400, "Only PNG/JPG/WEBP/GIF images allowed");

  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `uploads/${name}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new ApiError(500, `Supabase upload failed: ${error.message}`);

  const url = publicUrl(filePath);

  return json(
    {
      success: true,
      path: url,
      url: url,
    },
    201
  );
}

async function serveUpload(segments: string[]): Promise<Response> {
  const name = segments.join("/");
  if (!name || name.includes("..") || segments.length !== 1) {
    return json({ error: "Bad path" }, 400);
  }
  const filePath = `uploads/${name}`;
  const url = publicUrl(filePath);
  return Response.redirect(url, 302);
}

async function dispatch(
  req: Request,
  rest: string[],
  url: URL
): Promise<Response> {
  const method = req.method;
  const [resource, id] = rest;

  switch (resource) {
    case "products": {
      if (!id) {
        if (method === "GET") {
          const categoryId = url.searchParams.get("categoryId");
          const db = readDb();
          const products = categoryId
            ? db.products.filter((p) => p.categoryId === categoryId)
            : db.products;
          return json({ success: true, total: products.length, products });
        }
        if (method === "POST") {
          const product = createProduct(await readJson(req));
          return json({ success: true, product }, 201);
        }
        break;
      }
      if (method === "GET") {
        const db = readDb();
        const product = db.products.find((p) => p.id === id);
        if (!product) throw new ApiError(404, `Product not found: ${id}`);
        return json({ success: true, product });
      }
      if (method === "PUT" || method === "PATCH") {
        const product = updateProduct(id, await readJson(req));
        return json({ success: true, product });
      }
      if (method === "DELETE") {
        deleteProduct(id);
        return json({ success: true });
      }
      break;
    }

    case "categories": {
      if (!id) {
        if (method === "GET") {
          const db = readDb();
          return json({ success: true, categories: db.categories });
        }
        if (method === "POST") {
          const category = createCategory(await readJson(req));
          return json({ success: true, category }, 201);
        }
        break;
      }
      if (method === "PUT" || method === "PATCH") {
        const category = updateCategory(id, await readJson(req));
        return json({ success: true, category });
      }
      if (method === "DELETE") {
        deleteCategory(id);
        return json({ success: true });
      }
      break;
    }

    case "banners": {
      if (!id) {
        if (method === "GET") {
          const db = readDb();
          const banners = [...db.banners].sort(
            (a, b) => a.sortOrder - b.sortOrder
          );
          return json({ success: true, banners });
        }
        if (method === "POST") {
          const banner = createBanner(await readJson(req));
          return json({ success: true, banner }, 201);
        }
        break;
      }
      if (method === "PUT" || method === "PATCH") {
        const banner = updateBanner(id, await readJson(req));
        return json({ success: true, banner });
      }
      if (method === "DELETE") {
        deleteBanner(id);
        return json({ success: true });
      }
      break;
    }

    case "orders": {
      if (!id) {
        if (method === "GET") {
          const status = url.searchParams.get("status");
          let orders = readOrders();
          if (status) orders = orders.filter((o) => o.status === status);
          orders = [...orders].sort((a, b) => b.date.localeCompare(a.date));
          return json({ success: true, total: orders.length, orders });
        }
        break;
      }
      if (method === "PATCH" || method === "PUT") {
        const body = await readJson(req);
        const status = body["status"];
        if (typeof status !== "string")
          throw new ApiError(400, "status is required");
        const order = updateOrderStatus(id, status);
        return json({ success: true, order });
      }
      if (method === "GET") {
        const order = readOrders().find((o) => o.id === id);
        if (!order) throw new ApiError(404, `Order not found: ${id}`);
        return json({ success: true, order });
      }
      break;
    }

    case "messages": {
      if (!id) {
        if (method === "GET") {
          const messages = [...readMessages()].sort((a, b) =>
            b.createdAt.localeCompare(a.createdAt)
          );
          return json({ success: true, total: messages.length, messages });
        }
        break;
      }
      if (method === "PATCH" || method === "PUT") {
        const message = markMessageRead(id);
        return json({ success: true, message });
      }
      if (method === "GET") {
        const message = readMessages().find((m) => m.id === id);
        if (!message) throw new ApiError(404, `Message not found: ${id}`);
        return json({ success: true, message });
      }
      break;
    }

    case "stats": {
      if (method === "GET" && !id) {
        const from = url.searchParams.get("from") ?? undefined;
        const to = url.searchParams.get("to") ?? undefined;
        return json({ success: true, stats: computeStats(from, to) });
      }
      break;
    }

    case "upload": {
      if (method === "POST" && !id) return upload(req);
      break;
    }
  }

  throw new ApiError(404, `Not found: ${method} ${url.pathname}`);
}

export async function handleRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const seg = url.pathname.split("/").filter(Boolean);

    if (seg[0] === "health") return json({ success: true, ok: true });

    if (req.method === "GET" && seg[0] === "uploads") {
      return serveUpload(seg.slice(1));
    }

    if (seg[0] !== "api" || seg[1] !== "admin") {
      throw new ApiError(404, `Not found: ${url.pathname}`);
    }

    if (seg[2] === "login" && req.method === "POST" && seg.length === 3) {
      return await login(req);
    }

    const denied = requireAdmin(req);
    if (denied) return denied;

    return await dispatch(req, seg.slice(2), url);
  } catch (err) {
    if (err instanceof ApiError) {
      return json({ error: err.message }, err.status);
    }
    console.error("API error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}
