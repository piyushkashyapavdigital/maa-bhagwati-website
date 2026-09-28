import { describe, test, expect, beforeAll } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { setupDataDir, TEST_TOKEN } from "./helpers";
import { handleRequest } from "../src/router";

const BASE = "http://admin-api.test";
let dataDir: string;
let uploadsDir: string;

beforeAll(() => {
  dataDir = setupDataDir();
  uploadsDir = process.env.MBPB_UPLOADS_DIR!;
});

function call(
  pathname: string,
  method = "GET",
  body?: unknown,
  { token = TEST_TOKEN }: { token?: string | null } = {}
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (token) headers["x-admin-token"] = token;
  let payload: string | FormData | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    payload = JSON.stringify(body);
    headers["content-type"] = "application/json";
  }
  return handleRequest(
    new Request(BASE + pathname, { method, headers, body: payload })
  );
}

describe("auth enforcement on every route", () => {
  test("no token → 401", async () => {
    const res = await call("/api/admin/stats", "GET", undefined, {
      token: null,
    });
    expect(res.status).toBe(401);
  });

  test("wrong token → 401", async () => {
    const res = await call("/api/admin/products", "GET", undefined, {
      token: "wrong",
    });
    expect(res.status).toBe(401);
  });

  test("correct token → 200", async () => {
    const res = await call("/api/admin/stats");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(true);
  });

  test("login accepts correct token, rejects wrong", async () => {
    const ok = await call("/api/admin/login", "POST", { token: TEST_TOKEN }, { token: null });
    expect(ok.status).toBe(200);

    const bad = await call("/api/admin/login", "POST", { token: "nope" }, { token: null });
    expect(bad.status).toBe(401);
  });
});

describe("health & CORS", () => {
  test("GET /health works without token", async () => {
    const res = await call("/health", "GET", undefined, { token: null });
    expect(res.status).toBe(200);
  });

  test("OPTIONS preflight → 204 with CORS headers", async () => {
    const res = await handleRequest(
      new Request(BASE + "/api/admin/products", { method: "OPTIONS" })
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });

  test("unknown route → 404", async () => {
    const res = await call("/api/admin/whatever");
    expect(res.status).toBe(404);
  });
});

describe("product endpoints", () => {
  test("GET list (all, incl. inactive) → 3", async () => {
    const res = await call("/api/admin/products");
    const body = (await res.json()) as { total: number };
    expect(body.total).toBe(3);
  });

  test("GET list?categoryId=cat-2 → 2", async () => {
    const res = await call("/api/admin/products?categoryId=cat-2");
    const body = (await res.json()) as { total: number };
    expect(body.total).toBe(2);
  });

  test("PUT price change persists to db.json", async () => {
    const res = await call("/api/admin/products/prod-1", "PUT", {
      price: 42,
    });
    expect(res.status).toBe(200);
    const raw = JSON.parse(
      fs.readFileSync(path.join(dataDir, "db.json"), "utf8")
    );
    const p = raw.products.find((x: { id: string }) => x.id === "prod-1");
    expect(p.price).toBe(42);

    // revert
    await call("/api/admin/products/prod-1", "PUT", { price: 30 });
  });

  test("POST new product → 201 with prod-N id", async () => {
    const res = await call("/api/admin/products", "POST", {
      name: "Gangajal",
      categoryId: "cat-1",
      price: 80,
      unit: "1 litre",
      stock: 50,
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { product: { id: string; slug: string } };
    expect(body.product.id).toBe("prod-4");
    expect(body.product.slug).toBe("gangajal");

    // DELETE it again
    const del = await call("/api/admin/products/prod-4", "DELETE");
    expect(del.status).toBe(200);
  });

  test("DELETE unknown → 404", async () => {
    const res = await call("/api/admin/products/prod-999", "DELETE");
    expect(res.status).toBe(404);
  });

  test("PUT invalid price → 400", async () => {
    const res = await call("/api/admin/products/prod-1", "PUT", {
      price: "free",
    });
    expect(res.status).toBe(400);
  });
});

describe("category endpoints", () => {
  test("GET → 2 categories", async () => {
    const res = await call("/api/admin/categories");
    const body = (await res.json()) as { categories: unknown[] };
    expect(body.categories.length).toBe(2);
  });

  test("POST / PUT / DELETE roundtrip", async () => {
    const created = await call("/api/admin/categories", "POST", {
      name: "Vastu & Yantra",
    });
    expect(created.status).toBe(201);
    const { category } = (await created.json()) as {
      category: { id: string };
    };

    const updated = await call(`/api/admin/categories/${category.id}`, "PUT", {
      isActive: false,
    });
    expect(updated.status).toBe(200);

    const deleted = await call(`/api/admin/categories/${category.id}`, "DELETE");
    expect(deleted.status).toBe(200);
  });

  test("DELETE category with products → 409", async () => {
    const res = await call("/api/admin/categories/cat-1", "DELETE");
    expect(res.status).toBe(409);
  });
});

describe("banner endpoints", () => {
  test("POST / GET / PUT / DELETE", async () => {
    const created = await call("/api/admin/banners", "POST", {
      image: "/images/uploads/holiday.png",
      title: "Diwali Sale",
      link: "/category/havan-samagri",
    });
    expect(created.status).toBe(201);
    const { banner } = (await created.json()) as { banner: { id: string } };

    const list = await call("/api/admin/banners");
    const listBody = (await list.json()) as { banners: unknown[] };
    expect(listBody.banners.length).toBe(1);

    const toggled = await call(`/api/admin/banners/${banner.id}`, "PATCH", {
      isActive: false,
    });
    expect(toggled.status).toBe(200);

    const deleted = await call(`/api/admin/banners/${banner.id}`, "DELETE");
    expect(deleted.status).toBe(200);

    // persisted: banners field now in db.json
    const raw = JSON.parse(
      fs.readFileSync(path.join(dataDir, "db.json"), "utf8")
    );
    expect(Array.isArray(raw.banners)).toBe(true);
    expect(raw.banners.length).toBe(0);
  });
});

describe("order endpoints", () => {
  test("GET list sorted desc, optional status filter", async () => {
    const res = await call("/api/admin/orders");
    const body = (await res.json()) as { total: number; orders: { date: string }[] };
    expect(body.total).toBe(3);

    const filtered = await call("/api/admin/orders?status=Failed");
    const fBody = (await filtered.json()) as { total: number };
    expect(fBody.total).toBe(1);
  });

  test("PATCH status persists to orders.json", async () => {
    const res = await call("/api/admin/orders/pay_old", "PATCH", {
      status: "Shipped",
    });
    expect(res.status).toBe(200);
    const raw = JSON.parse(
      fs.readFileSync(path.join(dataDir, "orders.json"), "utf8")
    );
    const o = raw.find((x: { id: string }) => x.id === "pay_old");
    expect(o.status).toBe("Shipped");

    // revert
    await call("/api/admin/orders/pay_old", "PATCH", { status: "Confirmed" });
  });

  test("PATCH invalid status → 400, unknown id → 404", async () => {
    const bad = await call("/api/admin/orders/pay_old", "PATCH", {
      status: "Whatever",
    });
    expect(bad.status).toBe(400);

    const missing = await call("/api/admin/orders/pay_x", "PATCH", {
      status: "Shipped",
    });
    expect(missing.status).toBe(404);
  });
});

describe("message endpoints", () => {
  test("GET → 2, PATCH mark-read persists", async () => {
    const res = await call("/api/admin/messages");
    const body = (await res.json()) as { total: number };
    expect(body.total).toBe(2);

    const patched = await call("/api/admin/messages/msg-1", "PATCH", {});
    expect(patched.status).toBe(200);
    const raw = JSON.parse(
      fs.readFileSync(path.join(dataDir, "contact-messages.json"), "utf8")
    );
    const m = raw.find((x: { id: string }) => x.id === "msg-1");
    expect(m.read).toBe(true);
  });
});

describe("stats endpoint", () => {
  test("returns full stats payload", async () => {
    const res = await call("/api/admin/stats");
    const body = (await res.json()) as {
      stats: {
        totals: { revenue: number; orders: number };
        revenueSeries: unknown[];
        topProducts: unknown[];
      };
    };
    expect(body.stats.totals.revenue).toBe(375);
    expect(body.stats.totals.orders).toBe(3);
    expect(body.stats.revenueSeries.length).toBe(14);
    expect(body.stats.topProducts.length).toBeGreaterThan(0);
  });
});

describe("upload endpoint", () => {
  test("multipart PNG → 201 with /images/uploads path + file on disk", async () => {
    const fd = new FormData();
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    fd.append("file", new Blob([bytes], { type: "image/png" }), "test.png");

    const res = await call("/api/admin/upload", "POST", fd);
    expect(res.status).toBe(201);
    const body = (await res.json()) as { path: string; url: string };
    expect(body.path.startsWith("/images/uploads/")).toBe(true);
    expect(body.path.endsWith(".png")).toBe(true);

    const storedName = body.path.replace("/images/uploads/", "");
    expect(fs.existsSync(path.join(uploadsDir, storedName))).toBe(true);
  });

  test("missing file → 400, bad type → 400", async () => {
    const empty = new FormData();
    const noFile = await call("/api/admin/upload", "POST", empty);
    expect(noFile.status).toBe(400);

    const fd = new FormData();
    fd.append(
      "file",
      new Blob([new Uint8Array([1, 2, 3])], { type: "application/pdf" }),
      "doc.pdf"
    );
    const badType = await call("/api/admin/upload", "POST", fd);
    expect(badType.status).toBe(400);
  });

  test("GET /uploads/:name serves uploaded file, blocks traversal", async () => {
    const fd = new FormData();
    const bytes = new Uint8Array([0xff, 0xd8, 0xff]);
    fd.append("file", new Blob([bytes], { type: "image/jpeg" }), "a.jpg");
    const up = await call("/api/admin/upload", "POST", fd);
    const { path: stored } = (await up.json()) as { path: string };
    const name = stored.replace("/images/uploads/", "");

    const served = await call(`/uploads/${name}`, "GET", undefined, {
      token: null,
    });
    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toContain("image");

    const traversal = await call("/uploads/..%2F..%2Fetc%2Fpasswd", "GET", undefined, {
      token: null,
    });
    expect(traversal.status).toBeGreaterThanOrEqual(400);
  });
});
