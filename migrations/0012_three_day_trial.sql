ALTER TABLE trial_usage ADD COLUMN trial_started_at INTEGER;
ALTER TABLE trial_usage ADD COLUMN trial_expires_at INTEGER;

-- Preserve the original start window for users who had already used the old test-based trial.
UPDATE trial_usage
SET trial_started_at = created_at,
    trial_expires_at = created_at + 259200000
WHERE used_count > 0
  AND trial_started_at IS NULL;
