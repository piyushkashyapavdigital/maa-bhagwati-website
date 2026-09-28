import { describe, test, expect, beforeAll } from "bun:test";
import { setupDataDir } from "./helpers";
import { readOrders, updateOrderStatus, ORDER_STATUSES } from "../src/orders";
import { readMessages, markMessageRead } from "../src/messages";
import { ApiError } from "../src/errors";

beforeAll(() => {
  setupDataDir();
});

describe("orders", () => {
  test("readOrders returns 3 fixture orders with website shape", () => {
    const orders = readOrders();
    expect(orders.length).toBe(3);
    const o = orders[0]!;
    expect(typeof o.id).toBe("string");
    expect(typeof o.rzpOrderId).toBe("string");
    expect(typeof o.date).toBe("string");
    expect(o.customer.phone).toBe("9000000001");
    expect(Array.isArray(o.items)).toBe(true);
    expect(typeof o.total).toBe("number");
  });

  test("updateOrderStatus valid transition persists", () => {
    const o = updateOrderStatus("pay_old", "Shipped");
    expect(o.status).toBe("Shipped");
    const found = readOrders().find((x) => x.id === "pay_old");
    expect(found?.status).toBe("Shipped");

    // revert
    updateOrderStatus("pay_old", "Confirmed");
    expect(
      readOrders().find((x) => x.id === "pay_old")?.status
    ).toBe("Confirmed");
  });

  test("updateOrderStatus rejects invalid status", () => {
    expect(() => updateOrderStatus("pay_old", "Cancelled")).toThrow(ApiError);
    try {
      updateOrderStatus("pay_old", "whatever");
    } catch (e) {
      expect((e as ApiError).status).toBe(400);
    }
  });

  test("updateOrderStatus 404 on unknown id", () => {
    expect(() => updateOrderStatus("nope", "Shipped")).toThrow(ApiError);
  });

  test("ORDER_STATUSES includes the extended set", () => {
    expect(ORDER_STATUSES).toContain("Shipped");
    expect(ORDER_STATUSES).toContain("Delivered");
    expect(ORDER_STATUSES).toContain("Failed");
  });
});

describe("messages", () => {
  test("readMessages returns fixture messages", () => {
    const messages = readMessages();
    expect(messages.length).toBe(2);
    expect(messages[0]!.id).toBe("msg-1");
  });

  test("markMessageRead sets read=true and persists", () => {
    const m = markMessageRead("msg-1");
    expect(m.read).toBe(true);
    expect(readMessages().find((x) => x.id === "msg-1")?.read).toBe(true);
  });

  test("markMessageRead 404 unknown", () => {
    expect(() => markMessageRead("msg-404")).toThrow(ApiError);
  });
});
