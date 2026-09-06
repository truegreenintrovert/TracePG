-- Anonymous browser sessions are intentionally separate from progress data.
-- Replace this session identity with a real auth provider before storing PII.
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
  session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_last_seen_at
  ON sessions(last_seen_at);

-- Supabase owns passwords and authentication sessions. D1 stores only the
-- application profile reference and TracePG progress for authenticated users.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_last_seen_at
  ON users(last_seen_at);

-- Public study content is stored in D1 so it is not bundled into the frontend.
-- The original object is kept as JSON to preserve the current question shape.
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  subject TEXT NOT NULL,
  chapter TEXT,
  difficulty TEXT,
  source TEXT,
  source_no INTEGER,
  data TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_subject
  ON questions(subject);

CREATE TABLE IF NOT EXISTS pyq_questions (
  id INTEGER PRIMARY KEY,
  year TEXT NOT NULL,
  question_no INTEGER,
  subject TEXT,
  source_file TEXT,
  data TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pyq_questions_year
  ON pyq_questions(year);

CREATE INDEX IF NOT EXISTS idx_pyq_questions_subject
  ON pyq_questions(subject);

CREATE TABLE IF NOT EXISTS legal_pages (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  title TEXT NOT NULL,
  intro TEXT NOT NULL,
  sections TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS support_pages (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  title TEXT NOT NULL,
  intro TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  support_hours TEXT,
  support_cta_label TEXT,
  support_cta_url TEXT,
  sections TEXT NOT NULL,
  faqs TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

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
