ALTER TABLE payment_orders ADD COLUMN plan_id TEXT NOT NULL DEFAULT 'lifetime';
ALTER TABLE entitlements ADD COLUMN plan_id TEXT NOT NULL DEFAULT 'lifetime';
ALTER TABLE entitlements ADD COLUMN expires_at INTEGER;
