import { describe, test, expect, beforeAll } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { setupDataDir } from "./helpers";
import {
  readDb,
  writeDb,
  slugify,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../src/db";
import { ApiError } from "../src/errors";

let dir: string;

beforeAll(() => {
  dir = setupDataDir();
});

describe("slugify", () => {
  test("basic hinglish names", () => {
    expect(slugify("Badi Chowki")).toBe("badi-chowki");
    expect(slugify("Jal Ke Liye Balti")).toBe("jal-ke-liye-balti");
    expect(slugify("  Roli  ")).toBe("roli");
    expect(slugify("Dari Ya Anya Aasan")).toBe("dari-ya-anya-aasan");
  });
});

describe("banners migration", () => {
  test("readDb adds banners[] when missing without touching file yet", () => {
    const raw = JSON.parse(
      fs.readFileSync(path.join(dir, "db.json"), "utf8")
    );
    expect(raw.banners).toBeUndefined();

    const db = readDb();
    expect(db.banners).toEqual([]);
    expect(db.products.length).toBe(3);
  });

  test("writeDb persists banners field", () => {
    const db = readDb();
    writeDb(db);
    const raw = JSON.parse(
      fs.readFileSync(path.join(dir, "db.json"), "utf8")
    );
    expect(Array.isArray(raw.banners)).toBe(true);
    expect(raw.products.length).toBe(3);
  });
});

describe("product CRUD", () => {
  test("create assigns next prod id and auto-slug", () => {
    const p = createProduct({
      name: "Badi Chowki",
      categoryId: "cat-1",
      price: 499,
      unit: "1 pc",
    });
    expect(p.id).toBe("prod-4");
    expect(p.slug).toBe("badi-chowki");
    expect(p.stock).toBe(100);
    expect(p.isActive).toBe(true);
    expect(p.emoji).toBe("🪔");
    expect(p.referenceQuantity).toBe("1 pc");
    deleteProduct(p.id);
  });

  test("create validates required fields", () => {
    expect(() =>
      createProduct({ name: "", categoryId: "cat-1", price: 1, unit: "x" })
    ).toThrow(ApiError);
    expect(() =>
      createProduct({ name: "X", categoryId: "cat-1", price: -5, unit: "x" })
    ).toThrow(ApiError);
    expect(() =>
      createProduct({ name: "X", categoryId: "nope", price: 5, unit: "x" })
    ).toThrow(ApiError);
  });

  test("update changes price/stock/isActive/image", () => {
    const updated = updateProduct("prod-1", {
      price: 35,
      stock: 7,
      isActive: false,
      image: "/images/uploads/x.png",
    });
    expect(updated.price).toBe(35);
    expect(updated.stock).toBe(7);
    expect(updated.isActive).toBe(false);
    expect(updated.image).toBe("/images/uploads/x.png");

    // verify persisted
    const db = readDb();
    const p = db.products.find((x) => x.id === "prod-1");
    expect(p?.price).toBe(35);

    // revert
    updateProduct("prod-1", {
      price: 30,
      stock: 100,
      isActive: true,
      image: null,
    });
  });

  test("update rejects bad price and unknown id", () => {
    expect(() => updateProduct("prod-1", { price: -1 })).toThrow(ApiError);
    expect(() => updateProduct("prod-404", { price: 10 })).toThrow(ApiError);
  });

  test("delete removes product, 404 on second delete", () => {
    const p = createProduct({
      name: "Temp Item",
      categoryId: "cat-2",
      price: 10,
      unit: "1 pc",
    });
    deleteProduct(p.id);
    expect(readDb().products.some((x) => x.id === p.id)).toBe(false);
    expect(() => deleteProduct(p.id)).toThrow(ApiError);
  });
});

describe("category CRUD", () => {
  test("create / update / delete-with-guard", () => {
    const c = createCategory({ name: "Vastu Items" });
    expect(c.id).toBe("cat-3");
    expect(c.slug).toBe("vastu-items");

    const updated = updateCategory(c.id, { isActive: false, sortOrder: 99 });
    expect(updated.isActive).toBe(false);
    expect(updated.sortOrder).toBe(99);

    // empty category deletes fine
    deleteCategory(c.id);
    expect(readDb().categories.some((x) => x.id === c.id)).toBe(false);
  });

  test("cannot delete a category with products", () => {
    expect(() => deleteCategory("cat-1")).toThrow(ApiError);
    try {
      deleteCategory("cat-1");
    } catch (e) {
      expect((e as ApiError).status).toBe(409);
    }
  });
});

describe("banner CRUD", () => {
  test("create / toggle / delete", () => {
    const b = createBanner({
      image: "/images/uploads/banner.png",
      title: "Festive Sale",
    });
    expect(b.id).toBe("banner-1");
    expect(b.isActive).toBe(true);

    const toggled = updateBanner(b.id, { isActive: false, sortOrder: 5 });
    expect(toggled.isActive).toBe(false);
    expect(toggled.sortOrder).toBe(5);

    deleteBanner(b.id);
    expect(readDb().banners.some((x) => x.id === b.id)).toBe(false);
    expect(() => deleteBanner(b.id)).toThrow(ApiError);
  });

  test("create requires image", () => {
    expect(() => createBanner({})).toThrow(ApiError);
  });
});
