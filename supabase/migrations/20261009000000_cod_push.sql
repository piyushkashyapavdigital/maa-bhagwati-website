-- COD + distance delivery + push notifications
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Online';

-- One row per app installation. topic = 'admin' (shop owner phones)
-- or 'customer:<user_id>' for buyer order updates.
CREATE TABLE IF NOT EXISTS push_tokens (
  token TEXT PRIMARY KEY,
  topic TEXT NOT NULL DEFAULT 'admin',
  platform TEXT NOT NULL DEFAULT 'android',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
