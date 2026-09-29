-- Client app: link orders to the Supabase Auth user (magic-link login)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
