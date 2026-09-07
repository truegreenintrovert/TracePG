CREATE TABLE IF NOT EXISTS discount_codes (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value REAL NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

ALTER TABLE payment_orders ADD COLUMN discount_code TEXT;

CREATE INDEX IF NOT EXISTS idx_discount_codes_active
  ON discount_codes(active);
