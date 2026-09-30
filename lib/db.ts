import { supabase, isSupabaseConfigured, BUCKET } from "./supabase";
import dbData from "../data/db.json";

// ── Load local JSON data (fallback only) ────────────────────
// Source of truth is Supabase. db.json is used only when Supabase
// is unreachable / unconfigured / returns zero rows (e.g. local dev
// before migration, or Vercel env vars missing).
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
    deal_percent: p.deal_percent ?? p.dealPercent ?? 0,
    dealPercent: p.dealPercent ?? p.deal_percent ?? 0,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

function numericProductId(id: string): number {
  const m = /^prod-(\d+)$/.exec(id ?? "");
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

// Stable catalog order: oldest first, numeric id tiebreak, file order last.
// Without this, Supabase returns an updated row last (new heap tuple),
// so an edited product jumps to the bottom of the shop.
function sortProductsStable(list: DBProduct[]): DBProduct[] {
  return list
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const ca = a.p.created_at;
      const cb = b.p.created_at;
      if (ca && cb && ca !== cb) return ca < cb ? -1 : 1;
      if (ca && !cb) return -1;
      if (!ca && cb) return 1;
      const na = numericProductId(a.p.id);
      const nb = numericProductId(b.p.id);
      if (na !== nb) return na - nb;
      return a.i - b.i;
    })
    .map((x) => x.p);
}

function normalizeBanner(b: any): DBBanner {
  return {
    ...b,
    placement: b.placement ?? "home_top",
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
  deal_percent: number;
  dealPercent?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DBBanner {
  id: string;
  image: string;
  title?: string;
  link?: string;
  placement: string;
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

// ── Write mappers (camelCase from phone app → snake_case columns) ──
function productToRow(data: any): any {
  const row: any = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.name !== undefined) row.name = data.name;
  if (data.slug !== undefined) row.slug = data.slug;
  if (data.category_id !== undefined) row.category_id = data.category_id;
  else if (data.categoryId !== undefined) row.category_id = data.categoryId;
  if (data.image !== undefined) row.image = data.image;
  if (data.price !== undefined) row.price = data.price;
  if (data.unit !== undefined) row.unit = data.unit;
  if (data.reference_quantity !== undefined) row.reference_quantity = data.reference_quantity;
  else if (data.referenceQuantity !== undefined)
    row.reference_quantity = data.referenceQuantity;
  if (data.stock !== undefined) row.stock = data.stock;
  if (data.is_active !== undefined) row.is_active = data.is_active;
  else if (data.isActive !== undefined) row.is_active = data.isActive;
  if (data.emoji !== undefined) row.emoji = data.emoji;
  if (data.deal_percent !== undefined) row.deal_percent = data.deal_percent;
  else if (data.dealPercent !== undefined) row.deal_percent = data.dealPercent;
  return row;
}

function categoryToRow(data: any): any {
  const row: any = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.name !== undefined) row.name = data.name;
  if (data.slug !== undefined) row.slug = data.slug;
  if (data.sort_order !== undefined) row.sort_order = data.sort_order;
  else if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
  if (data.is_active !== undefined) row.is_active = data.is_active;
  else if (data.isActive !== undefined) row.is_active = data.isActive;
  if (data.coming_soon !== undefined) row.coming_soon = data.coming_soon;
  else if (data.comingSoon !== undefined) row.coming_soon = data.comingSoon;
  return row;
}

function bannerToRow(data: any): any {
  const row: any = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.image !== undefined) row.image = data.image;
  if (data.title !== undefined) row.title = data.title;
  if (data.link !== undefined) row.link = data.link;
  if (data.placement !== undefined) row.placement = data.placement;
  if (data.sort_order !== undefined) row.sort_order = data.sort_order;
  else if (data.sortOrder !== undefined) row.sort_order = data.sortOrder;
  if (data.is_active !== undefined) row.is_active = data.is_active;
  else if (data.isActive !== undefined) row.is_active = data.isActive;
  return row;
}

// Supabase order row (flat columns) → phone AdminApp shape (nested customer)
export function normalizeOrder(r: any): any {
  const c = r.customer ?? {};
  const customer = {
    name: c.name ?? r.customer_name ?? "",
    phone: c.phone ?? r.customer_phone ?? "",
    email: c.email ?? r.customer_email,
    address1: c.address1 ?? r.address1 ?? "",
    address2: c.address2 ?? r.address2,
    city: c.city ?? r.city ?? "",
    state: c.state ?? r.state ?? "",
    pincode: c.pincode ?? r.pincode ?? "",
    landmark: c.landmark ?? r.landmark,
    notes: c.notes ?? r.notes,
  };
  return {
    ...r,
    id: r.id ?? "",
    rzpOrderId: r.rzp_order_id ?? r.rzpOrderId ?? r.id ?? "",
    rzp_order_id: r.rzp_order_id ?? r.rzpOrderId ?? r.id ?? "",
    paymentId: r.payment_id ?? r.paymentId,
    payment_id: r.payment_id ?? r.paymentId,
    date: r.date,
    status: r.status ?? "Pending",
    customer,
    items: r.items ?? [],
    subtotal: r.subtotal ?? 0,
    deliveryCharge: r.delivery_charge ?? r.deliveryCharge ?? 0,
    delivery_charge: r.delivery_charge ?? r.deliveryCharge ?? 0,
    total: r.total ?? 0,
  };
}

function normalizeMessage(r: any): any {
  return { ...r, createdAt: r.createdAt ?? r.created_at };
}

// Phone/website order (nested customer, camelCase) → Supabase row
function orderToRow(data: any): any {
  const c = data.customer ?? {};
  const row: any = {
    id: data.id,
    rzp_order_id: data.rzp_order_id ?? data.rzpOrderId ?? data.id,
    date: data.date ?? new Date().toISOString(),
    status: data.status ?? "Pending",
    customer_name: c.name ?? data.customer_name,
    customer_phone: c.phone ?? data.customer_phone,
    customer_email: c.email ?? data.customer_email,
    address1: c.address1 ?? data.address1,
    address2: c.address2 ?? data.address2,
    city: c.city ?? data.city,
    state: c.state ?? data.state,
    pincode: c.pincode ?? data.pincode,
    landmark: c.landmark ?? data.landmark,
    notes: c.notes ?? data.notes,
    items: data.items ?? [],
    subtotal: data.subtotal ?? 0,
    delivery_charge: data.delivery_charge ?? data.deliveryCharge ?? 0,
    total: data.total ?? 0,
    payment_id: c.paymentId ?? data.payment_id ?? data.paymentId,
  };
  for (const k of Object.keys(row)) if (row[k] === undefined) delete row[k];
  return row;
}

// ── Categories (Supabase first, db.json fallback) ─────────
export async function getCategories() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) {
      const rows = data.map(normalizeCategory).filter((c: any) => c.is_active);
      if (rows.length > 0) return rows;
    }
  }
  const data = loadDBData();
  return (data.categories ?? []).map(normalizeCategory).filter((c: any) => c.is_active);
}

export async function getAllCategories() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) {
      const rows = data.map(normalizeCategory);
      if (rows.length > 0) return rows;
    }
  }
  const data = loadDBData();
  return (data.categories ?? []).map(normalizeCategory);
}

export async function getCategoryById(id: string) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) return normalizeCategory(data);
  }
  const data = loadDBData();
  const cat = (data.categories ?? []).find((c: any) => c.id === id);
  return cat ? normalizeCategory(cat) : undefined;
}

export async function createCategory(data: any) {
  const { data: result, error } = await supabase
    .from("categories")
    .insert(categoryToRow(data))
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateCategory(id: string, data: any) {
  const { data: result, error } = await supabase
    .from("categories")
    .update({ ...categoryToRow(data), updated_at: new Date().toISOString() })
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

// ── Products (Supabase first, db.json fallback) ─────────
export async function getProducts(categoryId?: string) {
  if (isSupabaseConfigured) {
    let query = supabase.from("products").select("*");
    if (categoryId) query = query.eq("category_id", categoryId);
    const { data, error } = await query;
    if (!error && data) {
      const rows = data.map(normalizeProduct).filter((p: any) => p.is_active);
      if (rows.length > 0 || categoryId) return sortProductsStable(rows);
      if (data.length > 0) return sortProductsStable(rows);
    }
  }
  const data = loadDBData();
  let products = (data.products ?? []).map(normalizeProduct);
  if (categoryId) products = products.filter((p: any) => p.category_id === categoryId);
  return sortProductsStable(products.filter((p: any) => p.is_active));
}

export async function getAllProducts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from("products").select("*");
    if (!error && data && data.length > 0) {
      return sortProductsStable(data.map(normalizeProduct));
    }
  }
  const data = loadDBData();
  return sortProductsStable((data.products ?? []).map(normalizeProduct));
}

export async function getProductById(id: string) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) return normalizeProduct(data);
  }
  const data = loadDBData();
  const prod = (data.products ?? []).find((p: any) => p.id === id);
  return prod ? normalizeProduct(prod) : undefined;
}

export async function createProduct(data: any) {
  const { data: result, error } = await supabase
    .from("products")
    .insert(productToRow(data))
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateProduct(id: string, data: any) {
  const { data: result, error } = await supabase
    .from("products")
    .update({ ...productToRow(data), updated_at: new Date().toISOString() })
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

// ── Banners (Supabase first, db.json fallback) ────────
export async function getBanners() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) {
      const rows = data.map(normalizeBanner).filter((b: any) => b.is_active);
      if (rows.length > 0 || data.length > 0) return rows;
    }
  }
  const data = loadDBData();
  return (data.banners ?? []).map(normalizeBanner).filter((b: any) => b.is_active);
}

export async function getBannerById(id: string) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) return normalizeBanner(data);
  }
  const data = loadDBData();
  const banner = (data.banners ?? []).find((b: any) => b.id === id);
  return banner ? normalizeBanner(banner) : undefined;
}

export async function createBanner(data: any) {
  const { data: result, error } = await supabase
    .from("banners")
    .insert(bannerToRow(data))
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateBanner(id: string, data: any) {
  const { data: result, error } = await supabase
    .from("banners")
    .update(bannerToRow(data))
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

// ── Orders (Supabase, phone-compatible shape) ─────────────
export async function readOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("date", { ascending: false });
  if (error) return [];
  return (data ?? []).map(normalizeOrder);
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data ? normalizeOrder(data) : undefined;
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
    .insert(orderToRow(data))
    .select()
    .single();
  if (error) throw error;
  return result ? normalizeOrder(result) : result;
}

// ── Client app orders (scoped to one Supabase Auth user) ────
export async function createClientOrder(userId: string, data: any) {
  const row = orderToRow(data);
  if (userId) row.user_id = userId;
  const { data: result, error } = await supabase
    .from("orders")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return result ? normalizeOrder(result) : result;
}

export async function getOrdersByUserId(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) return [];
  return (data ?? []).map(normalizeOrder);
}

// ── Contact Messages (Supabase, phone-compatible shape) ───
export async function readMessages() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(normalizeMessage);
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

// ── Stats (phone AdminApp StatsPayload shape) ─────────────
const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Failed"];

function emptyStats() {
  return {
    generatedAt: new Date().toISOString(),
    totals: {
      revenue: 0,
      orders: 0,
      activeProducts: 0,
      products: 0,
      categories: 0,
      customers: 0,
      unreadMessages: 0,
    },
    ordersByStatus: Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])),
    revenueSeries: [],
    topProducts: [],
    categoryRevenue: [],
    lowStock: [],
    recentOrders: [],
  };
}

export async function computeStats(from?: string, to?: string) {
  try {
    const [products, categories] = await Promise.all([
      getAllProducts(),
      getAllCategories(),
    ]);
    const { data: orderRows } = await supabase
      .from("orders")
      .select("*")
      .neq("status", "Failed");
    const allRows = (orderRows ?? []).map(normalizeOrder);
    const { data: msgRows } = await supabase
      .from("contact_messages")
      .select("id,read");

    const fromT = from ? new Date(from + "T00:00:00.000Z").getTime() : null;
    const toT = to ? new Date(to + "T23:59:59.999Z").getTime() : null;
    const inRange = (dateStr: string) => {
      const t = new Date(dateStr).getTime();
      if (fromT && t < fromT) return false;
      if (toT && t > toT) return false;
      return true;
    };
    const orders = allRows.filter((o: any) => inRange(o.date ?? ""));

    const revenue = orders.reduce((s: number, o: any) => s + (Number(o.total) || 0), 0);
    const customers = new Set(
      orders.map((o: any) => o.customer?.phone).filter(Boolean)
    ).size;

    const ordersByStatus: Record<string, number> = {};
    for (const s of ORDER_STATUSES) ordersByStatus[s] = 0;
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
    }

    const DAY = 86_400_000;
    const days =
      fromT && toT
        ? Math.min(365, Math.max(1, Math.ceil((toT - fromT) / DAY) + 1))
        : 14;
    const start = fromT
      ? new Date(fromT).toISOString().slice(0, 10)
      : new Date(Date.now() - (days - 1) * DAY).toISOString().slice(0, 10);
    const bucket = new Map<string, { revenue: number; orders: number }>();
    for (const o of orders) {
      const key = (o.date ?? "").slice(0, 10);
      if (!key) continue;
      const cur = bucket.get(key) ?? { revenue: 0, orders: 0 };
      cur.revenue += Number(o.total) || 0;
      cur.orders += 1;
      bucket.set(key, cur);
    }
    const revenueSeries = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(new Date(start).getTime() + i * DAY)
        .toISOString()
        .slice(0, 10);
      const v = bucket.get(date) ?? { revenue: 0, orders: 0 };
      revenueSeries.push({ date, revenue: v.revenue, orders: v.orders });
    }

    const byId = new Map<string, any>(products.map((p: any) => [p.id, p]));
    const agg = new Map<string, any>();
    for (const o of orders) {
      for (const item of o.items ?? []) {
        const p = byId.get(item.id);
        const cur = agg.get(item.id) ?? {
          id: item.id,
          name: p?.name ?? item.name ?? item.id,
          emoji: p?.emoji ?? "🪔",
          qty: 0,
          revenue: 0,
        };
        cur.qty += Number(item.qty) || 0;
        cur.revenue += (Number(item.price) || 0) * (Number(item.qty) || 0);
        agg.set(item.id, cur);
      }
    }
    const topProducts = [...agg.values()]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const catRev = new Map<string, number>();
    for (const o of orders) {
      for (const item of o.items ?? []) {
        const p: any = byId.get(item.id);
        const cid = p?.category_id ?? p?.categoryId ?? "uncategorized";
        catRev.set(cid, (catRev.get(cid) ?? 0) + (Number(item.price) || 0) * (Number(item.qty) || 0));
      }
    }
    const catById = new Map(categories.map((c: any) => [c.id, c.name]));
    const categoryRevenue = [...catRev.entries()]
      .map(([categoryId, rev]) => ({
        categoryId,
        name:
          catById.get(categoryId) ??
          (categoryId === "uncategorized" ? "Uncategorized" : categoryId),
        revenue: rev,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const lowStock = products
      .filter((p: any) => p.is_active && (Number(p.stock) || 0) <= 5)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji ?? "🪔",
        stock: p.stock ?? 0,
        unit: p.unit ?? "",
      }));

    const recentOrders = [...allRows]
      .sort((a: any, b: any) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 5)
      .map((o: any) => ({
        id: o.id,
        total: o.total ?? 0,
        status: o.status,
        date: o.date,
        customerName: o.customer?.name ?? "",
        itemsCount: (o.items ?? []).reduce((s: number, i: any) => s + (Number(i.qty) || 0), 0),
      }));

    const unreadMessages = (msgRows ?? []).filter((m: any) => !m.read).length;

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        revenue,
        orders: allRows.length,
        activeProducts: products.filter((p: any) => p.is_active).length,
        products: products.length,
        categories: categories.length,
        customers,
        unreadMessages,
      },
      ordersByStatus,
      revenueSeries,
      topProducts,
      categoryRevenue,
      lowStock,
      recentOrders,
    };
  } catch (e) {
    console.error("computeStats failed:", e);
    return emptyStats();
  }
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
