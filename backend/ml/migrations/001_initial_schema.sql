-- Initial Database Schema for Women Safety Analytics ML Service
-- PostgreSQL + PostGIS

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(255) PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('panic_alert', 'community_report')),
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
    category VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geospatial and other indexes
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_incidents_timestamp ON incidents(timestamp);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incidents(user_id);

-- Unsafe Zones (Clusters) Table
CREATE TABLE IF NOT EXISTS unsafe_zones (
    id VARCHAR(255) PRIMARY KEY,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    center_location GEOGRAPHY(POINT, 4326) NOT NULL,
    radius_meters DECIMAL(10, 2) NOT NULL,
    risk_score DECIMAL(3, 2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 5),
    incident_count INTEGER NOT NULL DEFAULT 0,
    last_incident_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zones_location ON unsafe_zones USING GIST(center_location);
CREATE INDEX IF NOT EXISTS idx_zones_risk_score ON unsafe_zones(risk_score);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON unsafe_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



