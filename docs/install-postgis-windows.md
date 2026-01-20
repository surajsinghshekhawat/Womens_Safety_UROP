# Installing PostGIS on Windows

## Option 1: Using Stack Builder (Easiest)

1. **Open Stack Builder** (from Start Menu)
   - Search for "Stack Builder" in Start Menu
   - Or find it in PostgreSQL folder

2. **Select your PostgreSQL installation**
   - Choose "PostgreSQL 18 on port 5433" (or your version)
   - Click Next

3. **Select PostGIS**
   - Expand "Spatial Extensions"
   - Check ✅ **PostGIS Bundle** (or PostGIS for PostgreSQL 18)
   - Click Next

4. **Install**
   - Follow the installer
   - Accept defaults
   - Complete installation

5. **Restart PostgreSQL service** (if needed)
   - Open Services (services.msc)
   - Find "postgresql-x64-18" (or your version)
   - Right-click → Restart

## Option 2: Download PostGIS Installer

1. **Download PostGIS**
   - Go to: https://postgis.net/install/
   - Or: https://download.osgeo.org/postgis/windows/
   - Download version matching your PostgreSQL (18)

2. **Run Installer**
   - Run the downloaded installer
   - Select your PostgreSQL installation
   - Complete installation

3. **Restart PostgreSQL**

## Option 3: Skip PostGIS for Now (Temporary)

If you want to proceed without PostGIS temporarily, we can modify the schema to not use PostGIS features. But PostGIS is recommended for geospatial queries.

## After Installation

Once PostGIS is installed, go back to pgAdmin and run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Then verify:
```sql
SELECT PostGIS_version();
```



