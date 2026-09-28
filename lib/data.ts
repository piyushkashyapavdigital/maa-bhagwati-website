import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const MESSAGES_FILE = path.join(DATA_DIR, "contact-messages.json");

export function readOrders(): any[] {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")) as any[];
  } catch {
    return [];
  }
}

export function readMessages(): any[] {
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf8")) as any[];
  } catch {
    return [];
  }
}

export function updateOrderStatus(id: string, status: string): any | undefined {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;
  orders[idx].status = status;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return orders[idx];
}

export function markMessageRead(id: string): any | undefined {
  const messages = readMessages();
  const idx = messages.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  messages[idx].read = true;
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  return messages[idx];
}
