// ──────────────────────────────────────────────────────────────
//  DB LAYER — data/db.json (file-backed)
//
//    Category: id, name, slug, sortOrder, isActive, comingSoon
//    Product : id, name, slug, categoryId, image, price, unit,
//              referenceQuantity, stock, isActive, emoji
//
//  Prices are seeded from the client's design reference. The
//  admin mobile app can replace them — UI always reads from here.
// ──────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { DELIVERY_CHARGE, FREE_DELIVERY_ABOVE } from "./pricing";

export { DELIVERY_CHARGE, FREE_DELIVERY_ABOVE };

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
  name: string; // Hinglish/English display name
  slug: string;
  categoryId: string;
  image: string | null; // set later via admin mobile app
  emoji: string; // temporary visual until real image is uploaded
  price: number; // INR per unit
  unit: string; // selling unit, e.g. "1 pack", "250 gram"
  referenceQuantity: string; // qty from client's reference list (informational)
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
}

export interface DBData {
  categories: DBCategory[];
  products: DBProduct[];
  banners: DBBanner[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// ── SEED: All four categories are live — Cat 1 (29 items),
//    Cat 2 (19 items), Cat 3 (14 items), Cat 4 (10 items). Total 72.
//    The cart is category-agnostic (one global cart).
function seedData(): DBData {
  const categories: DBCategory[] = [
    { id: "cat-1", name: "Mukhya Pooja Samagri", slug: "mukhya-pooja-samagri", sortOrder: 1, isActive: true },
    { id: "cat-2", name: "Rudrabhishek Samagri", slug: "rudrabhishek-samagri", sortOrder: 2, isActive: true },
    { id: "cat-3", name: "Havan Samagri", slug: "havan-samagri", sortOrder: 3, isActive: true },
    { id: "cat-4", name: "Pooja Bartan & Aavashyak Saman", slug: "pooja-bartan-aavashyak-saman", sortOrder: 4, isActive: true },
  ];

  const P = (
    n: number,
    name: string,
    emoji: string,
    price: number,
    unit: string,
    stock = 100,
    categoryId = "cat-1"
  ): DBProduct => ({
    id: `prod-${n}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    categoryId,
    image: null,
    emoji,
    price,
    unit,
    referenceQuantity: unit,
    stock,
    isActive: true,
  });

  const products: DBProduct[] = [
    P(1, "Roli", "🔴", 30, "1 pack"),
    P(2, "Mauli", "🧵", 20, "1 pc"),
    P(3, "Dhoop", "🕯️", 50, "1 pack"),
    P(4, "Shahad", "🍯", 120, "1 bottle"),
    P(5, "Gangajal", "🫗", 40, "1 bottle"),
    P(6, "Janeu", "🪢", 60, "5 pieces"),
    P(7, "Panchmeva", "🥜", 180, "250 gram"),
    P(8, "Elaichi", "🫒", 50, "20 gram"),
    P(9, "Supari", "🟤", 40, "7 pieces"),
    P(10, "Nariyal", "🥥", 40, "1 piece"),
    P(11, "Khop", "🥥", 25, "1 piece", 200),
    P(12, "Paan Ke Patte", "🍃", 30, "5 pieces", 200),
    P(13, "Aam Ke Patte", "🌿", 30, "9 pieces", 200),
    P(14, "Chawal", "🌾", 120, "2 kg"),
    P(15, "Doodh", "🥛", 60, "1 litre"),
    P(16, "Dahi", "🍶", 40, "500 gram"),
    P(17, "Shakkar", "🧂", 30, "250 gram"),
    P(18, "Desi Ghee", "🧈", 650, "1 kg", 50),
    P(19, "Deepak", "🪔", 25, "1 piece"),
    P(20, "Haldi", "🟡", 50, "50 gram"),
    P(21, "Phool Mala", "🌸", 60, "2 pieces"),
    P(22, "Different Fruits", "🍎", 100, "1 set"),
    P(23, "Mithai", "🍬", 150, "500 gram"),
    P(24, "White Cloth", "⚪", 50, "1 piece"),
    P(25, "Peela / Laal Cloth", "🟠", 60, "1 piece"),
    P(26, "Rui Ki Jyot", "🕯", 30, "1 pack"),
    P(27, "Lota", "🪙", 80, "1 piece", 50),
    P(28, "Aasan", "🧎", 120, "1 piece", 50),
    P(29, "Shringar Samagri", "💐", 150, "1 set", 50),

    // ── Category 2: Rudrabhishek Samagri ──
    // Reference quantities shown as the selling unit (e.g. "108 leaves").
    // Prices are temporary dev seed values — editable via admin later.
    P(30, "Belpatra", "🌿", 49, "108 leaves", 100, "cat-2"),
    P(31, "Belfal", "🍈", 35, "1 pc", 100, "cat-2"),
    P(32, "Ganne Ka Juice", "🥤", 59, "1 litre", 100, "cat-2"),
    P(33, "Bhang", "🪴", 30, "1 bundle", 100, "cat-2"),
    P(34, "Dhatura", "🌸", 30, "1 bundle", 100, "cat-2"),
    P(35, "Shami Ke Patte", "🍃", 39, "1 bundle", 100, "cat-2"),
    P(36, "Aam Ke Patte", "🥭", 25, "12 leaves", 100, "cat-2"),
    P(37, "Aam Ke Pushp", "🌼", 40, "1 bunch", 100, "cat-2"),
    P(38, "Kaale Til", "⚫", 45, "50 gram", 100, "cat-2"),
    P(39, "Safed Til", "⚪", 50, "50 gram", 100, "cat-2"),
    P(40, "Samudri Jhaag", "🌊", 60, "50 gram", 100, "cat-2"),
    P(41, "Chandi Ke Naag-Nagin", "🐍", 450, "1 pair", 50, "cat-2"),
    P(42, "Rudraksh Ki Mala", "📿", 350, "1 pc", 50, "cat-2"),
    P(43, "Bhasm", "🤍", 50, "1 packet", 100, "cat-2"),
    P(44, "Peela Chandan", "🟡", 70, "25 gram", 100, "cat-2"),
    P(45, "Nagkesar", "🧡", 55, "10 gram", 100, "cat-2"),
    P(46, "Churma Aata", "🌾", 65, "500 gram", 100, "cat-2"),
    P(47, "Jau", "🌾", 35, "50 gram", 100, "cat-2"),
    P(48, "Brahman Varani Samagri", "🙏", 99, "1 set", 100, "cat-2"),

    // ── Category 3: Havan Samagri ──
    // Reference quantities shown as the selling unit (e.g. "250 gram").
    // Prices are temporary dev seed values — editable via admin later.
    P(49, "Havan Samagri", "🪔", 199, "1 kg", 100, "cat-3"),
    P(50, "Jau", "🌾", 49, "250 gram", 100, "cat-3"),
    P(51, "Til", "🟤", 65, "250 gram", 100, "cat-3"),
    P(52, "Kamalgatte", "🪷", 85, "50 gram", 100, "cat-3"),
    P(53, "Indrajo", "🌿", 75, "50 gram", 100, "cat-3"),
    P(54, "Guggal", "🟠", 70, "50 gram", 100, "cat-3"),
    P(55, "Loban", "🟡", 55, "50 gram", 100, "cat-3"),
    P(56, "Agar", "🪵", 95, "50 gram", 100, "cat-3"),
    P(57, "Tagar", "🌱", 80, "50 gram", 100, "cat-3"),
    P(58, "Beligiri", "🟢", 90, "50 gram", 100, "cat-3"),
    P(59, "Jatamansi", "🍃", 110, "50 gram", 100, "cat-3"),
    P(60, "Nagar Motha", "🌰", 85, "50 gram", 100, "cat-3"),
    P(61, "Aam Ki Lakdi", "🥢", 60, "3 packets", 100, "cat-3"),
    P(62, "Havan Kund", "🏺", 1500, "1 pc", 50, "cat-3"),

    // ── Category 4: Pooja Bartan & Aavashyak Samaan ──
    P(63, "Badi Chowki", "🪑", 499, "1 pc", 50, "cat-4"),
    P(64, "Parat", "🥣", 149, "1 pc", 50, "cat-4"),
    P(65, "Jal Ke Liye Balti", "🪣", 199, "1 pc", 50, "cat-4"),
    P(66, "Thali", "🍽️", 79, "4 pc", 100, "cat-4"),
    P(67, "Chammach", "🥄", 15, "5 pc", 100, "cat-4"),
    P(68, "Glass", "🥛", 25, "1 pc", 100, "cat-4"),
    P(69, "Katori", "🥣", 35, "6 pc", 100, "cat-4"),
    P(70, "Dona", "🍂", 49, "1 packet", 100, "cat-4"),
    P(71, "Chauki", "🪑", 350, "2 pc", 50, "cat-4"),
    P(72, "Dari Ya Anya Aasan", "🧎", 199, "1 pc", 50, "cat-4"),
  ];

  return { categories, products, banners: [] };
}

// ── File access ──────────────────────────────────────────────
function ensureDb(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seedData(), null, 2), "utf8");
  }
}

export function readDb(): DBData {
  ensureDb();
  try {
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DBData;
    if (!parsed.categories || !parsed.products) throw new Error("bad db shape");
    if (!parsed.banners) parsed.banners = [];
    return parsed;
  } catch {
    const seed = seedData();
    writeDb(seed);
    return seed;
  }
}

// ── CRUD ──────────────────────────────────────────────────
export function createProduct(data: Omit<DBProduct, "id">): DBProduct {
  const db = readDb();
  const id = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const product = { ...data, id };
  db.products.push(product);
  writeDb(db);
  return product;
}

export function updateProduct(id: string, data: Partial<DBProduct>): DBProduct | undefined {
  const db = readDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  db.products[idx] = { ...db.products[idx], ...data };
  writeDb(db);
  return db.products[idx];
}

export function deleteProduct(id: string): boolean {
  const db = readDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  db.products.splice(idx, 1);
  writeDb(db);
  return true;
}

export function createCategory(data: Omit<DBCategory, "id">): DBCategory {
  const db = readDb();
  const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const category = { ...data, id };
  db.categories.push(category);
  writeDb(db);
  return category;
}

export function updateCategory(id: string, data: Partial<DBCategory>): DBCategory | undefined {
  const db = readDb();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  db.categories[idx] = { ...db.categories[idx], ...data };
  writeDb(db);
  return db.categories[idx];
}

export function deleteCategory(id: string): boolean {
  const db = readDb();
  const idx = db.categories.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  db.categories.splice(idx, 1);
  writeDb(db);
  return true;
}

export function createBanner(data: Omit<DBBanner, "id">): DBBanner {
  const db = readDb();
  const id = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const banner = { ...data, id };
  db.banners.push(banner);
  writeDb(db);
  return banner;
}

export function updateBanner(id: string, data: Partial<DBBanner>): DBBanner | undefined {
  const db = readDb();
  const idx = db.banners.findIndex((b) => b.id === id);
  if (idx === -1) return undefined;
  db.banners[idx] = { ...db.banners[idx], ...data };
  writeDb(db);
  return db.banners[idx];
}

export function deleteBanner(id: string): boolean {
  const db = readDb();
  const idx = db.banners.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  db.banners.splice(idx, 1);
  writeDb(db);
  return true;
}

export function writeDb(data: DBData): void {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ── Read helpers (active rows only) ──────────────────────────
export function getCategories(): DBCategory[] {
  return readDb()
    .categories.filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getProducts(categoryId?: string): DBProduct[] {
  const db = readDb();
  return db.products.filter(
    (p) => p.isActive && (!categoryId || p.categoryId === categoryId)
  );
}

export function getProductById(id: string): DBProduct | undefined {
  return readDb().products.find((p) => p.id === id);
}

export interface Catalog {
  categories: DBCategory[];
  products: DBProduct[];
}

export function getCatalog(): Catalog {
  const db = readDb();
  return {
    categories: db.categories
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    products: db.products.filter((p) => p.isActive),
  };
}

// ──────────────────────────────────────────────────────────────
//  SERVER-SIDE CART QUOTE — the single source of truth for money.
//  The frontend NEVER sends amounts; it only sends
//  { productId, quantity } and this recomputes from the DB.
// ──────────────────────────────────────────────────────────────
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

export function quoteCart(
  input: { productId: string; quantity: number }[]
): CartQuote {
  const db = readDb();
  const byId = new Map(db.products.map((p) => [p.id, p]));
  const catById = new Map(db.categories.map((c) => [c.id, c]));

  const items: QuoteItem[] = [];
  const seen = new Set<string>();

  for (const line of input) {
    const product = byId.get(line.productId);
    const quantity = Math.floor(Number(line.quantity));
    if (!product || !product.isActive || !Number.isFinite(quantity) || quantity < 1) continue;
    if (seen.has(product.id)) continue; // dedupe
    seen.add(product.id);

    items.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      categoryName: catById.get(product.categoryId)?.name ?? "Pooja Samagri",
      image: product.image,
      emoji: product.emoji,
      unit: product.unit,
      price: product.price,
      quantity,
      lineTotal: product.price * quantity,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const deliveryCharge = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;

  return { items, itemCount, subtotal, deliveryCharge, total: subtotal + deliveryCharge };
}
