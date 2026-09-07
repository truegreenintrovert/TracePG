CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email TEXT,
  category TEXT NOT NULL,
  rating INTEGER,
  message TEXT NOT NULL,
  contact_requested INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  admin_note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at
  ON feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_status
  ON feedback(status);
