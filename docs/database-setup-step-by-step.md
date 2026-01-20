# Database Setup - Step by Step Guide

## Your PostgreSQL Details
- Port: **5433** (not default 5432)
- Password: suraj@0810
- User: postgres

## Step 1: Open PostgreSQL Command Line

Open PowerShell and run:
```powershell
psql -U postgres -p 5433
```

When prompted, enter password: `suraj@0810`

You should see:
```
postgres=#
```

## Step 2: Create Database

In the psql prompt, run:
```sql
CREATE DATABASE women_safety_db;
```

You should see: `CREATE DATABASE`

## Step 3: Create User (Optional - can use postgres user)

If you want a separate user:
```sql
CREATE USER women_safety_user WITH PASSWORD 'suraj@0810';
GRANT ALL PRIVILEGES ON DATABASE women_safety_db TO women_safety_user;
```

Or just use the `postgres` user (simpler for development).

## Step 4: Connect to New Database

```sql
\c women_safety_db
```

You should see: `You are now connected to database "women_safety_db" as user "postgres".`

## Step 5: Enable PostGIS Extension

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

You should see: `CREATE EXTENSION`

## Step 6: Verify PostGIS

```sql
SELECT PostGIS_version();
```

You should see the PostGIS version number.

## Step 7: Run Migration

Exit psql first:
```sql
\q
```

Then run the migration file:
```powershell
cd C:\Users\Suraj\Desktop\urop\backend\ml\migrations
psql -U postgres -p 5433 -d women_safety_db -f 001_initial_schema.sql
```

Enter password when prompted: `suraj@0810`

## Step 8: Verify Tables Created

```powershell
psql -U postgres -p 5433 -d women_safety_db -c "\dt"
```

You should see `incidents` and `unsafe_zones` tables.

## Step 9: Create Environment Files

### For ML Service

Create file: `backend/ml/.env`

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=women_safety_db
DB_USER=postgres
DB_PASSWORD=suraj@0810
DB_SSL=false
```

### For Backend API

Create file: `backend/api/.env`

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=women_safety_db
DB_USER=postgres
DB_PASSWORD=suraj@0810
DB_SSL=false
```

## Step 10: Test Connection

```powershell
psql -U postgres -p 5433 -d women_safety_db -c "SELECT COUNT(*) FROM incidents;"
```

Should return: `count` with `0` (no incidents yet).

## Quick Reference Commands

```powershell
# Connect to database
psql -U postgres -p 5433 -d women_safety_db

# List all tables
\dt

# View table structure
\d incidents

# View all data in table
SELECT * FROM incidents;

# Exit psql
\q
```



