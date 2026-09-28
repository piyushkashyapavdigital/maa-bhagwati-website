import fs from "node:fs";
import path from "node:path";
import { ApiError } from "./errors";
import { dbFile, dataDir } from "./paths";
import type { DbData, DBProduct, DBCategory, DBBanner } from "./types";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Read db.json — migrates `banners[]` in memory if missing. Never creates
 *  the file (the website owns seeding); throws if absent. */
export function readDb(): DbData {
  const file = dbFile();
  if (!fs.existsSync(file)) {
    throw new ApiError(
      500,
      `data/db.json not found at ${file} — start the website once to seed it`
    );
  }
  let data: Partial<DbData>;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<DbData>;
  } catch {
    throw new ApiError(500, "db.json is not valid JSON");
  }
  if (!Array.isArray(data.categories) || !Array.isArray(data.products)) {
    throw new ApiError(500, "db.json missing categories/products arrays");
  }
  if (!Array.isArray(data.banners)) data.banners = [];
  return data as DbData;
}

export function writeDb(data: DbData): void {
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(dbFile(), JSON.stringify(data, null, 2), "utf8");
}

// ── Products ────────────────────────────────────────────────

const PRODUCT_FIELDS = [
  "name",
  "slug",
  "categoryId",
  "image",
  "emoji",
  "price",
  "unit",
  "referenceQuantity",
  "stock",
  "isActive",
] as const;

type ProductPatch = Partial<Pick<DBProduct, (typeof PRODUCT_FIELDS)[number]>>;

function validateProductPatch(
  patch: Record<string, unknown>,
  { partial }: { partial: boolean }
): ProductPatch {
  const out: ProductPatch = {};
  const has = (k: string) => k in patch;

  if (!partial || has("name")) {
    const name = patch["name"];
    if (typeof name !== "string" || !name.trim())
      throw new ApiError(400, "name is required");
    out.name = name.trim();
  }
  if (has("slug")) {
    if (typeof patch["slug"] !== "string")
      throw new ApiError(400, "slug must be a string");
    out.slug = (patch["slug"] as string).trim();
  }
  if (!partial || has("categoryId")) {
    const categoryId = patch["categoryId"];
    if (typeof categoryId !== "string" || !categoryId)
      throw new ApiError(400, "categoryId is required");
    out.categoryId = categoryId;
  }
  if (has("image")) {
    const image = patch["image"];
    if (image !== null && typeof image !== "string")
      throw new ApiError(400, "image must be a string or null");
    out.image = image as string | null;
  }
  if (has("emoji")) {
    if (typeof patch["emoji"] !== "string")
      throw new ApiError(400, "emoji must be a string");
    out.emoji = patch["emoji"] as string;
  }
  if (!partial || has("price")) {
    const price = patch["price"];
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0)
      throw new ApiError(400, "price must be a number >= 0");
    out.price = price;
  }
  if (!partial || has("unit")) {
    const unit = patch["unit"];
    if (typeof unit !== "string" || !unit.trim())
      throw new ApiError(400, "unit is required");
    out.unit = unit.trim();
  }
  if (has("referenceQuantity")) {
    const rq = patch["referenceQuantity"];
    if (typeof rq !== "string")
      throw new ApiError(400, "referenceQuantity must be a string");
    out.referenceQuantity = rq;
  }
  if (has("stock")) {
    const stock = patch["stock"];
    if (typeof stock !== "number" || !Number.isFinite(stock) || stock < 0)
      throw new ApiError(400, "stock must be a number >= 0");
    out.stock = Math.floor(stock);
  }
  if (has("isActive")) {
    if (typeof patch["isActive"] !== "boolean")
      throw new ApiError(400, "isActive must be a boolean");
    out.isActive = patch["isActive"] as boolean;
  }
  return out;
}

function nextProdId(products: DBProduct[]): string {
  let max = 0;
  for (const p of products) {
    const m = /^prod-(\d+)$/.exec(p.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `prod-${max + 1}`;
}

export function createProduct(body: Record<string, unknown>): DBProduct {
  const db = readDb();
  const patch = validateProductPatch(body, { partial: false });
  const categoryId = patch.categoryId!;
  if (!db.categories.some((c) => c.id === categoryId))
    throw new ApiError(400, `Unknown categoryId: ${categoryId}`);

  const product: DBProduct = {
    id: nextProdId(db.products),
    name: patch.name!,
    slug:
      typeof body["slug"] === "string" && (body["slug"] as string).trim()
        ? (body["slug"] as string).trim()
        : slugify(patch.name!),
    categoryId,
    image: patch.image ?? null,
    emoji: patch.emoji ?? "🪔",
    price: patch.price!,
    unit: patch.unit!,
    referenceQuantity: patch.referenceQuantity ?? patch.unit!,
    stock: patch.stock ?? 100,
    isActive: patch.isActive ?? true,
  };
  db.products.push(product);
  writeDb(db);
  return product;
}

export function updateProduct(
  id: string,
  body: Record<string, unknown>
): DBProduct {
  const db = readDb();
  const product = db.products.find((p) => p.id === id);
  if (!product) throw new ApiError(404, `Product not found: ${id}`);

  const patch = validateProductPatch(body, { partial: true });
  if (patch.categoryId && !db.categories.some((c) => c.id === patch.categoryId))
    throw new ApiError(400, `Unknown categoryId: ${patch.categoryId}`);

  Object.assign(product, patch);
  writeDb(db);
  return product;
}

export function deleteProduct(id: string): void {
  const db = readDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length === before)
    throw new ApiError(404, `Product not found: ${id}`);
  writeDb(db);
}

// ── Categories ──────────────────────────────────────────────

export function createCategory(body: Record<string, unknown>): DBCategory {
  const db = readDb();
  const name = body["name"];
  if (typeof name !== "string" || !name.trim())
    throw new ApiError(400, "name is required");

  let max = 0;
  for (const c of db.categories) {
    const m = /^cat-(\d+)$/.exec(c.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  const sortOrder =
    typeof body["sortOrder"] === "number"
      ? (body["sortOrder"] as number)
      : db.categories.length + 1;

  const category: DBCategory = {
    id: `cat-${max + 1}`,
    name: name.trim(),
    slug:
      typeof body["slug"] === "string" && (body["slug"] as string).trim()
        ? (body["slug"] as string).trim()
        : slugify(name),
    sortOrder,
    isActive: body["isActive"] !== false,
    ...(body["comingSoon"] === true ? { comingSoon: true } : {}),
  };
  db.categories.push(category);
  db.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  writeDb(db);
  return category;
}

export function updateCategory(
  id: string,
  body: Record<string, unknown>
): DBCategory {
  const db = readDb();
  const category = db.categories.find((c) => c.id === id);
  if (!category) throw new ApiError(404, `Category not found: ${id}`);

  if ("name" in body) {
    const name = body["name"];
    if (typeof name !== "string" || !name.trim())
      throw new ApiError(400, "name must be a non-empty string");
    category.name = name.trim();
  }
  if ("slug" in body) {
    const slug = body["slug"];
    if (typeof slug !== "string" || !slug.trim())
      throw new ApiError(400, "slug must be a non-empty string");
    category.slug = slug.trim();
  }
  if ("sortOrder" in body) {
    const so = body["sortOrder"];
    if (typeof so !== "number" || !Number.isFinite(so))
      throw new ApiError(400, "sortOrder must be a number");
    category.sortOrder = so;
  }
  if ("isActive" in body) {
    if (typeof body["isActive"] !== "boolean")
      throw new ApiError(400, "isActive must be a boolean");
    category.isActive = body["isActive"] as boolean;
  }
  if ("comingSoon" in body) {
    if (typeof body["comingSoon"] !== "boolean")
      throw new ApiError(400, "comingSoon must be a boolean");
    if (body["comingSoon"]) category.comingSoon = true;
    else delete category.comingSoon;
  }
  db.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  writeDb(db);
  return category;
}

export function deleteCategory(id: string): void {
  const db = readDb();
  const inUse = db.products.filter((p) => p.categoryId === id).length;
  if (inUse > 0)
    throw new ApiError(
      409,
      `Cannot delete: ${inUse} product(s) still in this category`
    );
  const before = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id);
  if (db.categories.length === before)
    throw new ApiError(404, `Category not found: ${id}`);
  writeDb(db);
}

// ── Banners ─────────────────────────────────────────────────

export function createBanner(body: Record<string, unknown>): DBBanner {
  const db = readDb();
  const image = body["image"];
  if (typeof image !== "string" || !image.trim())
    throw new ApiError(400, "image is required");

  let max = 0;
  for (const b of db.banners) {
    const m = /^banner-(\d+)$/.exec(b.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  const banner: DBBanner = {
    id: `banner-${max + 1}`,
    image: image.trim(),
    title: typeof body["title"] === "string" ? (body["title"] as string) : undefined,
    link: typeof body["link"] === "string" ? (body["link"] as string) : undefined,
    sortOrder:
      typeof body["sortOrder"] === "number"
        ? (body["sortOrder"] as number)
        : db.banners.length + 1,
    isActive: body["isActive"] !== false,
    createdAt: new Date().toISOString(),
  };
  db.banners.push(banner);
  writeDb(db);
  return banner;
}

export function updateBanner(
  id: string,
  body: Record<string, unknown>
): DBBanner {
  const db = readDb();
  const banner = db.banners.find((b) => b.id === id);
  if (!banner) throw new ApiError(404, `Banner not found: ${id}`);

  if ("image" in body) {
    if (typeof body["image"] !== "string" || !(body["image"] as string).trim())
      throw new ApiError(400, "image must be a non-empty string");
    banner.image = (body["image"] as string).trim();
  }
  if ("title" in body) {
    banner.title =
      typeof body["title"] === "string" ? (body["title"] as string) : undefined;
  }
  if ("link" in body) {
    banner.link =
      typeof body["link"] === "string" ? (body["link"] as string) : undefined;
  }
  if ("sortOrder" in body) {
    const so = body["sortOrder"];
    if (typeof so !== "number" || !Number.isFinite(so))
      throw new ApiError(400, "sortOrder must be a number");
    banner.sortOrder = so;
  }
  if ("isActive" in body) {
    if (typeof body["isActive"] !== "boolean")
      throw new ApiError(400, "isActive must be a boolean");
    banner.isActive = body["isActive"] as boolean;
  }
  writeDb(db);
  return banner;
}

export function deleteBanner(id: string): void {
  const db = readDb();
  const before = db.banners.length;
  db.banners = db.banners.filter((b) => b.id !== id);
  if (db.banners.length === before)
    throw new ApiError(404, `Banner not found: ${id}`);
  writeDb(db);
}
