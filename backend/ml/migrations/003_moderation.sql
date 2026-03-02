-- Moderation: optional reason for verify/reject (admin workflow)
ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS moderation_reason VARCHAR(255) DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_incidents_verified ON incidents(verified);
