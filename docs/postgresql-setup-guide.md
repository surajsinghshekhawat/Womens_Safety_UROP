# PostgreSQL + PostGIS Setup Guide

## Prerequisites

- Windows 10/11
- Administrator access
- Internet connection

## Step 1: Install PostgreSQL

### Option A: Using PostgreSQL Installer (Recommended)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Choose components:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (GUI tool)
   - ✅ Command Line Tools
   - ✅ Stack Builder
4. Set password for `postgres` user (remember this!) - suraj@0810
5. Port: 5433 (default)
6. Complete installation

### Option B: Using Chocolatey (if you have it)

```powershell
choco install postgresql
```

## Step 2: Enable PostGIS Extension

1. Open **pgAdmin 4** (from Start Menu)
2. Connect to PostgreSQL server (password: your postgres password)
3. Right-click on your database → **Query Tool**
4. Run:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Or use command line:
```powershell
psql -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

## Step 3: Create Database and User

### Using pgAdmin:

1. Right-click **Databases** → **Create** → **Database**
2. Name: `women_safety_db`
3. Owner: `postgres`
4. Click **Save**

### Using Command Line:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE women_safety_db;

# Create user
CREATE USER women_safety_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE women_safety_db TO women_safety_user;

# Connect to new database
\c women_safety_db

# Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

# Grant schema privileges
GRANT ALL ON SCHEMA public TO women_safety_user;

# Exit
\q
```

## Step 4: Run Migrations

```powershell
cd backend/ml/migrations
psql -U women_safety_user -d women_safety_db -f 001_initial_schema.sql
```

## Step 5: Verify Installation

```powershell
psql -U women_safety_user -d women_safety_db -c "SELECT PostGIS_version();"
```

Should return PostGIS version.

## Step 6: Test Connection

```powershell
psql -U women_safety_user -d women_safety_db -c "SELECT COUNT(*) FROM incidents;"
```

## Troubleshooting

### Can't connect to PostgreSQL
- Check if PostgreSQL service is running: `services.msc` → PostgreSQL
- Check firewall settings
- Verify port 5432 is not blocked

### PostGIS extension not found
- Install PostGIS: https://postgis.net/install/
- Or use Stack Builder from PostgreSQL installation

### Permission denied
- Make sure user has proper privileges
- Check database ownership

## Environment Variables

Create `.env` file in `backend/ml/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=women_safety_db
DB_USER=women_safety_user
DB_PASSWORD=your_secure_password
DB_SSL=false
```

Create `.env` file in `backend/api/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=women_safety_db
DB_USER=women_safety_user
DB_PASSWORD=your_secure_password
DB_SSL=false
```

## Quick Start Commands

```powershell
# Start PostgreSQL service (if not running)
net start postgresql-x64-15  # Version may vary

# Connect to database
psql -U women_safety_user -d women_safety_db

# List tables
\dt

# View table structure
\d incidents

# Exit
\q
```



