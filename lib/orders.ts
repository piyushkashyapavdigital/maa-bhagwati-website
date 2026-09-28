import {
  readOrders as supabaseReadOrders,
  updateOrderStatus as supabaseUpdateOrderStatus,
  createOrder,
} from "@/lib/db";

export interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  qty: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  email?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  notes?: string;
}

export type OrderStatus = "Pending" | "Confirmed" | "Failed";

export interface Order {
  id: string;
  rzpOrderId: string;
  paymentId?: string;
  date: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

export { createOrder };
export async function readOrders(): Promise<Order[]> {
  const orders = await supabaseReadOrders();
  return orders as Order[];
}

export async function writeOrders(order: Order): Promise<Order> {
  const result = await createOrder(order);
  return result as Order;
}

export async function updateOrder(orderId: string, status: OrderStatus): Promise<Order | undefined> {
  try {
    const result = await supabaseUpdateOrderStatus(orderId, status);
    return result as Order | undefined;
  } catch {
    return undefined;
  }
}
