export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  comingSoon?: boolean;
}

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  image: string | null;
  emoji: string;
  price: number;
  unit: string;
  referenceQuantity: string;
  stock: number;
  isActive: boolean;
}

export interface DBBanner {
  id: string;
  image: string;
  title?: string;
  link?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface DbData {
  categories: DBCategory[];
  products: DBProduct[];
  banners: DBBanner[];
}

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

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Failed";

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

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
  read?: boolean;
}
