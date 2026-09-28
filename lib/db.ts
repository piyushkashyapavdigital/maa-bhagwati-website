import { supabase, BUCKET } from "./supabase";
import dbData from "../data/db.json";

// ── Load local JSON data ──────────────────────────────
function loadDBData(): any {
  return dbData ?? { categories: [], products: [], banners: [] };
}

// Normalize JSON data (camelCase → snake_case aliases)
function normalizeCategory(c: any): DBCategory {
  return {
    id: c.id ?? "",
    name: c.name ?? "",
    slug: c.slug ?? "",
    sort_order: c.sort_order ?? c.sortOrder ?? 0,
    is_active: c.is_active ?? c.isActive ?? true,
    sortOrder: c.sortOrder ?? c.sort_order ?? 0,
    isActive: c.isActive ?? c.is_active ?? true,
    coming_soon: c.coming_soon ?? c.comingSoon ?? false,
    comingSoon: c.comingSoon ?? c.coming_soon ?? false,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

function normalizeProduct(p: any): DBProduct {
  return {
    id: p.id ?? "",
    name: p.name ?? "",
    slug: p.slug ?? "",
    category_id: p.category_id ?? p.categoryId ?? "",
    categoryId: p.categoryId ?? p.category_id ?? "",
    image: p.image ?? null,
    price: p.price ?? 0,
    unit: p.unit ?? "",
    reference_quantity: p.reference_quantity ?? p.referenceQuantity ?? "",
    referenceQuantity: p.referenceQuantity ?? p.reference_quantity ?? "",
    stock: p.stock ?? 0,
    is_active: p.is_active ?? p.isActive ?? true,
    isActive: p.isActive ?? p.is_active ?? true,
    emoji: p.emoji ?? "",
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

function normalizeBanner(b: any): DBBanner {
  return {
    ...b,
    sort_order: b.sort_order ?? b.sortOrder ?? 0,
    is_active: b.is_active ?? b.isActive ?? true,
    sortOrder: b.sortOrder ?? b.sort_order ?? 0,
    isActive: b.isActive ?? b.is_active ?? true,
  };
}

// ── Interfaces ──────────────────────────────────────
export interface DBCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  sortOrder?: number;
  is_active: boolean;
  isActive?: boolean;
  coming_soon?: boolean;
  comingSoon?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DBProduct {
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
  created_at?: string;
  updated_at?: string;
}

export interface DBBanner {
  id: string;
  image: string;
  title?: string;
  link?: string;
  sort_order: number;
  sortOrder?: number;
  is_active: boolean;
  isActive?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DBData {
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

export interface Order {
  id: string;
  rzpOrderId: string;
  paymentId?: string;
  date: string;
  status: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

// ── Categories (from JSON) ──────────────────────────
export async function getCategories() {
  const data = loadDBData();
  return (data.categories ?? []).map(normalizeCategory).filter((c: any) => c.is_active);
}

export async function getAllCategories() {
  const data = loadDBData();
  return (data.categories ?? []).map(normalizeCategory);
}

export async function getCategoryById(id: string) {
  const data = loadDBData();
  const cat = (data.categories ?? []).find((c: any) => c.id === id);
  return cat ? normalizeCategory(cat) : undefined;
}

export async function createCategory(data: any) {
  const { data: result, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateCategory(id: string, data: any) {
  const { data: result, error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);
  return !error;
}

// ── Products (from JSON) ────────────────────────────
export async function getProducts(categoryId?: string) {
  const data = loadDBData();
  let products = (data.products ?? []).map(normalizeProduct);
  if (categoryId) products = products.filter((p: any) => p.category_id === categoryId);
  return products.filter((p: any) => p.is_active);
}

export async function getAllProducts() {
  const data = loadDBData();
  return (data.products ?? []).map(normalizeProduct);
}

export async function getProductById(id: string) {
  const data = loadDBData();
  const prod = (data.products ?? []).find((p: any) => p.id === id);
  return prod ? normalizeProduct(prod) : undefined;
}

export async function createProduct(data: any) {
  const { data: result, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateProduct(id: string, data: any) {
  const { data: result, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  return !error;
}

// ── Banners (from JSON) ─────────────────────────────
export async function getBanners() {
  const data = loadDBData();
  return (data.banners ?? []).map(normalizeBanner).filter((b: any) => b.is_active);
}

export async function getBannerById(id: string) {
  const data = loadDBData();
  const banner = (data.banners ?? []).find((b: any) => b.id === id);
  return banner ? normalizeBanner(banner) : undefined;
}

export async function createBanner(data: any) {
  const { data: result, error } = await supabase
    .from("banners")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateBanner(id: string, data: any) {
  const { data: result, error } = await supabase
    .from("banners")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteBanner(id: string) {
  const { error } = await supabase
    .from("banners")
    .delete()
    .eq("id", id);
  return !error;
}

// ── Orders (from Supabase) ──────────────────────────
export async function readOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("date", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data;
}

export async function updateOrderStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createOrder(data: any) {
  const { data: result, error } = await supabase
    .from("orders")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result;
}

// ── Contact Messages (from Supabase) ────────────────
export async function readMessages() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getMessageById(id: string) {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data;
}

export async function markMessageRead(id: string) {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({ read: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── Stats ───────────────────────────────────────────
export async function computeStats(from?: string, to?: string) {
  let query = supabase.from("orders").select("*").neq("status", "Failed");
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  const { data: orders, error } = await query;
  if (error) return { revenue: 0, orders: 0, ordersByStatus: {}, revenueSeries: [], recentOrders: [] };

  const filteredOrders = orders ?? [];
  const revenue = filteredOrders.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);

  const ordersByStatus: Record<string, number> = {};
  for (const o of orders ?? []) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
  }

  const bucket = new Map<string, { revenue: number; orders: number }>();
  for (const o of filteredOrders) {
    const key = o.date?.slice(0, 10) ?? "";
    const cur = bucket.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(o.total);
    cur.orders += 1;
    bucket.set(key, cur);
  }

  const days = (from && to)
    ? Math.min(365, Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000) + 1))
    : 14;
  const now = Date.now();
  const start = from
    ? new Date(from).toISOString().slice(0, 10)
    : new Date(now - (days - 1) * 86_400_000).toISOString().slice(0, 10);

  const revenueSeries = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(new Date(start).getTime() + i * 86_400_000).toISOString().slice(0, 10);
    const v = bucket.get(date) ?? { revenue: 0, orders: 0 };
    revenueSeries.push({ date, revenue: v.revenue, orders: v.orders });
  }

  const recentOrders = filteredOrders
    .filter((o: any) => o.status !== "Failed")
    .sort((a: any, b: any) => b.date?.localeCompare(a.date ?? "") ?? 0)
    .slice(0, 5)
    .map((o: any) => ({ id: o.id, date: o.date, total: o.total, status: o.status }));

  return { revenue, orders: orders.length, ordersByStatus, revenueSeries, recentOrders };
}

// ── Cart Quote ──────────────────────────────────
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

export async function quoteCart(
  input: { productId: string; quantity: number }[]
): Promise<CartQuote> {
  const products = await getAllProducts();
  const categories = await getCategories();
  const byId = new Map<string, DBProduct>(products.map((p: DBProduct) => [p.id, p]));
  const catById = new Map<string, DBCategory>(categories.map((c: DBCategory) => [c.id, c]));

  const items: QuoteItem[] = [];
  const seen = new Set<string>();

  for (const line of input) {
    const product = byId.get(line.productId);
    const quantity = Math.floor(Number(line.quantity));
    if (!product || !product.is_active || !Number.isFinite(quantity) || quantity < 1) continue;
    if (seen.has(product.id)) continue;
    seen.add(product.id);

    items.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      categoryId: product.category_id,
      categoryName: catById.get(product.category_id)?.name ?? "Pooja Samagri",
      image: product.image,
      emoji: product.emoji ?? "",
      unit: product.unit,
      price: product.price,
      quantity,
      lineTotal: product.price * quantity,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const DELIVERY_CHARGE = 70;
  const FREE_DELIVERY_ABOVE = 500;
  const deliveryCharge = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;

  return { items, itemCount, subtotal, deliveryCharge, total: subtotal + deliveryCharge };
}

export async function getCatalog() {
  const categories = await getCategories();
  const products = await getAllProducts();
  return { categories, products };
}
