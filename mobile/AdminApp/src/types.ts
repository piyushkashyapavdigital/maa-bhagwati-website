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
  dealPercent: number;
}

export interface DBBanner {
  id: string;
  image: string;
  title?: string;
  link?: string;
  placement: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export const BANNER_PLACEMENTS = [
  { id: 'home_top', label: 'Home top' },
  { id: 'home_mid', label: 'Home middle' },
] as const;

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
  | 'Pending'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Failed';

export const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Shipped',
  'Delivered',
  'Failed',
];

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

export interface StatsPayload {
  generatedAt: string;
  totals: {
    revenue: number;
    orders: number;
    activeProducts: number;
    products: number;
    categories: number;
    customers: number;
    unreadMessages: number;
  };
  ordersByStatus: Record<string, number>;
  revenueSeries: { date: string; revenue: number; orders: number }[];
  topProducts: {
    id: string;
    name: string;
    emoji: string;
    qty: number;
    revenue: number;
  }[];
  categoryRevenue: { categoryId: string; name: string; revenue: number }[];
  lowStock: {
    id: string;
    name: string;
    emoji: string;
    stock: number;
    unit: string;
  }[];
  recentOrders: {
    id: string;
    total: number;
    status: string;
    date: string;
    customerName: string;
    itemsCount: number;
  }[];
}
