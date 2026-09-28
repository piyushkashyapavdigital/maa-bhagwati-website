import { describe, test, expect, beforeAll } from "bun:test";
import { setupDataDir, TEST_TOKEN } from "./helpers";
import { requireAdmin, adminToken } from "../src/auth";

beforeAll(() => {
  setupDataDir();
});

function reqWith(headers: Record<string, string>): Request {
  return new Request("http://test/api/admin/stats", { headers });
}

describe("requireAdmin", () => {
  test("missing token → 401", () => {
    const res = requireAdmin(reqWith({}));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  test("wrong token → 401", () => {
    const res = requireAdmin(reqWith({ "x-admin-token": "nope" }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  test("empty token header → 401", () => {
    const res = requireAdmin(reqWith({ "x-admin-token": "" }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  test("correct token → allowed (null)", () => {
    const res = requireAdmin(reqWith({ "x-admin-token": TEST_TOKEN }));
    expect(res).toBeNull();
    expect(adminToken()).toBe(TEST_TOKEN);
  });

  test("ADMIN_TOKEN unset on server → 500", () => {
    const saved = process.env.ADMIN_TOKEN;
    delete process.env.ADMIN_TOKEN;
    const res = requireAdmin(reqWith({ "x-admin-token": "anything" }));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(500);
    if (saved !== undefined) process.env.ADMIN_TOKEN = saved;
  });
});
