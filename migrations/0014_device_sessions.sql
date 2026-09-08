-- Keep one active web session and one active app session for each account.
CREATE TABLE IF NOT EXISTS device_sessions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_type TEXT NOT NULL CHECK (client_type IN ('web', 'app')),
  session_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, client_type)
);

CREATE INDEX IF NOT EXISTS idx_device_sessions_last_seen_at
  ON device_sessions(last_seen_at);
