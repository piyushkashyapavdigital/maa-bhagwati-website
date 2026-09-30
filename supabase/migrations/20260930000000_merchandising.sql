-- Client home merchandising: banner placements + product deals (admin-managed)
ALTER TABLE banners ADD COLUMN IF NOT EXISTS placement TEXT DEFAULT 'home_top';
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_percent INTEGER DEFAULT 0;
