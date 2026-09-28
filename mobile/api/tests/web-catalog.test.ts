import { describe, test, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "../src/paths";

/**
 * Read-only regression guard on the website's real data.
 * Never writes — just reads data/db.json with an absolute path.
 */
describe("website catalog regression (read-only)", () => {
  const file = path.join(REPO_ROOT, "data", "db.json");

  test("data/db.json exists and is valid JSON", () => {
    expect(fs.existsSync(file)).toBe(true);
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(Array.isArray(raw.categories)).toBe(true);
    expect(Array.isArray(raw.products)).toBe(true);
  });

  test("4 live categories, none comingSoon", () => {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(raw.categories.length).toBe(4);
    for (const c of raw.categories) {
      expect(c.comingSoon).toBeFalsy();
      expect(c.isActive).toBe(true);
    }
  });

  test("72 products: 29 + 19 + 14 + 10 per category", () => {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(raw.products.length).toBe(72);

    const byCat = (id: string) =>
      raw.products.filter((p: { categoryId: string }) => p.categoryId === id)
        .length;
    expect(byCat("cat-1")).toBe(29);
    expect(byCat("cat-2")).toBe(19);
    expect(byCat("cat-3")).toBe(14);
    expect(byCat("cat-4")).toBe(10);
  });

  test("every product has required fields with sane values", () => {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const p of raw.products) {
      expect(typeof p.id).toBe("string");
      expect(p.id).toMatch(/^prod-\d+$/);
      expect(typeof p.name).toBe("string");
      expect(p.name.length).toBeGreaterThan(0);
      expect(typeof p.price).toBe("number");
      expect(p.price).toBeGreaterThanOrEqual(0);
      expect(typeof p.unit).toBe("string");
      expect(typeof p.stock).toBe("number");
      expect(p.isActive).toBe(true);
    }
  });

  test("banners field is optional — absent until admin creates first", () => {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (raw.banners !== undefined) {
      expect(Array.isArray(raw.banners)).toBe(true);
    }
  });
});
