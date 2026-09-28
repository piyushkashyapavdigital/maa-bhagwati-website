import fs from "node:fs";
import path from "node:path";
import { ApiError } from "./errors";
import { ordersFile, dataDir } from "./paths";
import type { Order, OrderStatus } from "./types";

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Failed",
];

export function readOrders(): Order[] {
  const file = ordersFile();
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(data) ? (data as Order[]) : [];
  } catch {
    return [];
  }
}

export function writeOrders(orders: Order[]): void {
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(ordersFile(), JSON.stringify(orders, null, 2), "utf8");
}

export function updateOrderStatus(id: string, status: string): Order {
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new ApiError(
      400,
      `Invalid status "${status}". Allowed: ${ORDER_STATUSES.join(", ")}`
    );
  }
  const orders = readOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) throw new ApiError(404, `Order not found: ${id}`);
  order.status = status as OrderStatus;
  writeOrders(orders);
  return order;
}
