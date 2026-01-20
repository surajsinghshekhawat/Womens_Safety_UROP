# Finding psql on Windows

## Option 1: Find PostgreSQL Installation Path

PostgreSQL is usually installed in one of these locations:

- `C:\Program Files\PostgreSQL\15\bin\` (or 14, 16, etc.)
- `C:\Program Files (x86)\PostgreSQL\15\bin\`

## Quick Way to Find It

1. Open File Explorer
2. Navigate to `C:\Program Files\PostgreSQL\`
3. Look for folders like `15`, `14`, `16`, etc.
4. Go into that folder → `bin` folder
5. You should see `psql.exe`

## Option 2: Use pgAdmin (Easier!)

Instead of command line, use pgAdmin GUI:

1. Open **pgAdmin 4** from Start Menu
2. Connect to server (enter password: suraj@0810)
3. Right-click on **Databases** → **Create** → **Database**
4. Name: `women_safety_db`
5. Click **Save**
6. Right-click on `women_safety_db` → **Query Tool**
7. Run: `CREATE EXTENSION IF NOT EXISTS postgis;`

## Option 3: Add to PATH (Permanent Solution)

1. Find PostgreSQL bin folder (see Option 1)
2. Copy the full path (e.g., `C:\Program Files\PostgreSQL\15\bin`)
3. Open System Properties → Environment Variables
4. Edit PATH variable
5. Add the PostgreSQL bin path
6. Restart PowerShell


