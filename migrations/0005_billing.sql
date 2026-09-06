CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id
  ON payment_orders(user_id);

CREATE TABLE IF NOT EXISTS entitlements (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_order_id TEXT,
  provider_payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS trial_usage (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
