# Step 8: Database Integration Plan

## Overview

Replace in-memory storage with PostgreSQL + PostGIS for persistent data storage. This will enable:
- Data persistence across service restarts
- Efficient geospatial queries
- Scalability for production use
- Better data integrity

## Database Schema Design

### 1. Incidents Table
```sql
CREATE TABLE incidents (
    id VARCHAR(255) PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS point
    timestamp TIMESTAMPTZ NOT NULL,
    type VARCHAR(50) NOT NULL,  -- 'panic_alert' or 'community_report'
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
    category VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geospatial index for fast location queries
CREATE INDEX idx_incidents_location ON incidents USING GIST(location);
CREATE INDEX idx_incidents_timestamp ON incidents(timestamp);
CREATE INDEX idx_incidents_type ON incidents(type);
```

### 2. Unsafe Zones (Clusters) Table
```sql
CREATE TABLE unsafe_zones (
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

CREATE INDEX idx_zones_location ON unsafe_zones USING GIST(center_location);
CREATE INDEX idx_zones_risk_score ON unsafe_zones(risk_score);
```

### 3. Users Table (for backend API)
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Emergency Contacts Table
```sql
CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_user_id ON emergency_contacts(user_id);
```

### 5. Panic Alerts Table
```sql
CREATE TABLE panic_alerts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',  -- 'active', 'resolved', 'cancelled'
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    contacts_notified INTEGER DEFAULT 0
);

CREATE INDEX idx_panic_location ON panic_alerts USING GIST(location);
CREATE INDEX idx_panic_status ON panic_alerts(status);
CREATE INDEX idx_panic_user_id ON panic_alerts(user_id);
```

## Implementation Steps

### Step 1: Database Setup
1. Install PostgreSQL with PostGIS extension
2. Create database and user
3. Enable PostGIS extension

### Step 2: ML Service Database Integration
1. Add PostgreSQL dependencies (`psycopg2` or `asyncpg`)
2. Create database connection module
3. Update `storage.py` to use PostgreSQL
4. Add geospatial query functions

### Step 3: Backend API Database Integration
1. Add PostgreSQL client (`pg` or `pg-promise`)
2. Create database connection module
3. Update routes to use database

### Step 4: Migrations
1. Create migration scripts
2. Set up migration tool (Alembic for Python, node-pg-migrate for Node.js)

### Step 5: Testing
1. Test data persistence
2. Test geospatial queries
3. Test performance

## Dependencies Needed

### ML Service (Python)
- `psycopg2-binary` or `asyncpg` - PostgreSQL driver
- `sqlalchemy` - ORM (optional, can use raw SQL)
- `alembic` - Migrations (optional)

### Backend API (Node.js)
- `pg` or `pg-promise` - PostgreSQL client
- `node-pg-migrate` - Migrations (optional)

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=women_safety_db
DB_USER=women_safety_user
DB_PASSWORD=your_password_here
DB_SSL=false
```

## Geospatial Queries Examples

### Find incidents within radius
```sql
SELECT * FROM incidents
WHERE ST_DWithin(
    location,
    ST_MakePoint(80.2707, 13.0827)::geography,
    1000  -- meters
);
```

### Find nearest unsafe zones
```sql
SELECT *, ST_Distance(center_location, ST_MakePoint(80.2707, 13.0827)::geography) as distance
FROM unsafe_zones
ORDER BY distance
LIMIT 10;
```

## Migration Strategy

1. **Phase 1**: Set up database schema
2. **Phase 2**: Migrate existing in-memory data (if any)
3. **Phase 3**: Update ML service to use database
4. **Phase 4**: Update backend API to use database
5. **Phase 5**: Remove in-memory storage code

## Testing Checklist

- [ ] Database connection works
- [ ] Can insert incidents
- [ ] Can query incidents by location
- [ ] Geospatial queries work correctly
- [ ] Data persists after service restart
- [ ] Performance is acceptable (< 100ms for queries)
- [ ] Concurrent access works correctly



