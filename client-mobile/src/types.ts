// ── Shared types (mirror website lib/db.ts + phone admin shapes) ──

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  sortOrder?: number;
  is_active: boolean;
  isActive?: boolean;
  coming_soon?: boolean;
  comingSoon?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  categoryId?: string;
  image: string | null;
  price: number;
  unit: string;
  reference_quantity: string;
  referenceQuantity?: string;
  stock: number;
  is_active: boolean;
  isActive?: boolean;
  emoji: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  unit: string;
  emoji: string;
  image: string | null;
}

export interface QuoteLine {
  productId: string;
  quantity: number;
}

export interface QuoteItem {
  productId: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  image: string | null;
  emoji: string;
  unit: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface CartQuote {
  items: QuoteItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

export interface AddressForm {
  name: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  notes: string;
}

export interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  rzpOrderId: string;
  date: string;
  status: string;
  customer: AddressForm;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

export function validateAddress(f: AddressForm): Partial<AddressForm> {
  const e: Partial<AddressForm> = {};
  if (!f.name.trim()) e.name = 'Name is required';
  if (!f.phone.trim() || !/^[6-9]\d{9}$/.test(f.phone))
    e.phone = 'Enter a valid 10-digit mobile number';
  if (!f.address1.trim()) e.address1 = 'Address is required';
  if (!f.city.trim()) e.city = 'City is required';
  if (!f.state) e.state = 'Select a state';
  if (!f.pincode.trim() || !/^\d{6}$/.test(f.pincode))
    e.pincode = 'Enter a valid 6-digit pincode';
  return e;
}

/** Display-only cart math. Server /api/quote is authoritative. */
export function estimateTotals(
  items: { priceSnapshot: number; quantity: number }[],
  deliveryCharge = 70,
  freeAbove = 500,
): { count: number; subtotal: number; delivery: number; total: number } {
  const subtotal = items.reduce((s, i) => s + i.priceSnapshot * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= freeAbove ? 0 : deliveryCharge;
  return { count, subtotal, delivery, total: subtotal + delivery };
}
