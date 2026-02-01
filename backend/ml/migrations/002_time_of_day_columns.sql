-- Migration: Time-of-day modeling support
-- Adds timezone_offset_minutes + incident_local_hour columns for time-dependent hotspots.
-- Safe to run multiple times.

ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS timezone_offset_minutes INTEGER;

ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS incident_local_hour SMALLINT;

CREATE INDEX IF NOT EXISTS idx_incidents_local_hour ON incidents(incident_local_hour);

