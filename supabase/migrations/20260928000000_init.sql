-- Supabase migration: Maa Bhagwati Pooja Bhandar tables
-- Run this in Supabase Dashboard → SQL Editor

-- ── Categories ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  coming_soon BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES categories(id),
  image TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '1 pc',
  reference_quantity TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  emoji TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Banners ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  image TEXT NOT NULL,
  title TEXT,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Orders ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  rzp_order_id TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Pending',
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  landmark TEXT,
  notes TEXT,
  items JSONB DEFAULT '[]',
  subtotal INTEGER DEFAULT 0,
  delivery_charge INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Contact Messages ────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  subject TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Enable Row Level Security (optional - disable for admin API) ──
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Disable RLS for now (admin API handles auth via x-admin-token)
-- Re-enable and create policies after auth is properly set up
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- ── Insert seed categories ──────────────────────────────
INSERT INTO categories (id, name, slug, sort_order, is_active) VALUES
  ('cat-1', 'Mukhya Pooja Samagri', 'mukhya-pooja-samagri', 1, true),
  ('cat-2', 'Rudrabhishek Samagri', 'rudrabhishek-samagri', 2, true),
  ('cat-3', 'Havan Samagri', 'havan-samagri', 3, true),
  ('cat-4', 'Pooja Bartan & Aavashyak Saman', 'pooja-bartan-aavashyak-saman', 4, true)
ON CONFLICT (id) DO NOTHING;

-- ── Insert seed products ────────────────────────────────
INSERT INTO products (id, name, slug, category_id, price, unit, reference_quantity, stock, is_active, emoji) VALUES
  ('prod-1', 'Roli', 'roli', 'cat-1', 30, '1 pack', '1 pack', 100, true, '🔴'),
  ('prod-2', 'Mauli', 'mauli', 'cat-1', 20, '1 pc', '1 pc', 100, true, '🧵'),
  ('prod-3', 'Dhoop', 'dhoop', 'cat-1', 50, '1 pack', '1 pack', 100, true, '🕯️'),
  ('prod-4', 'Shahad', 'shahad', 'cat-1', 120, '1 bottle', '1 bottle', 100, true, '🍯'),
  ('prod-5', 'Gangajal', 'gangajal', 'cat-1', 40, '1 bottle', '1 bottle', 100, true, '🫗'),
  ('prod-6', 'Janeu', 'janeu', 'cat-1', 60, '5 pieces', '5 pieces', 100, true, '🪢'),
  ('prod-7', 'Panchmeva', 'panchmeva', 'cat-1', 180, '250 gram', '250 gram', 100, true, '🥜'),
  ('prod-8', 'Elaichi', 'elaichi', 'cat-1', 50, '20 gram', '20 gram', 100, true, '🫒'),
  ('prod-9', 'Supari', 'supari', 'cat-1', 40, '7 pieces', '7 pieces', 100, true, '🟤'),
  ('prod-10', 'Nariyal', 'nariyal', 'cat-1', 40, '1 piece', '1 piece', 100, true, '🥥')
ON CONFLICT (id) DO NOTHING;
