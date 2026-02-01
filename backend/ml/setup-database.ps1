# Database Setup Script for Windows
# This script helps you set up the database using pgAdmin or psql

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Women Safety Analytics - Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Try to find psql
$psqlPaths = @(
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\14\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $psqlPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        Write-Host "[OK] Found psql at: $path" -ForegroundColor Green
        break
    }
}

if (-not $psqlPath) {
    Write-Host "[INFO] psql not found in common locations" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please use pgAdmin instead:" -ForegroundColor Yellow
    Write-Host "1. Open pgAdmin 4 from Start Menu" -ForegroundColor White
    Write-Host "2. Connect to server (enter your PostgreSQL password)" -ForegroundColor White
    Write-Host "3. Right-click Databases -> Create -> Database" -ForegroundColor White
    Write-Host "4. Name: women_safety_db" -ForegroundColor White
    Write-Host "5. Right-click women_safety_db -> Query Tool" -ForegroundColor White
    Write-Host "6. Run: CREATE EXTENSION IF NOT EXISTS postgis;" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run the migration SQL file manually in Query Tool" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Cyan
Write-Host ""

# Database configuration
$dbName = "women_safety_db"
$dbUser = "postgres"
$dbPort = "5433"
$dbPassword = $env:PGPASSWORD

if (-not $dbPassword) {
    $dbPassword = Read-Host "Enter PostgreSQL password for user '$dbUser'"
}

# Set password as environment variable for psql
$env:PGPASSWORD = $dbPassword

Write-Host "Step 1: Creating database..." -ForegroundColor Yellow
& $psqlPath -U $dbUser -p $dbPort -c "CREATE DATABASE $dbName;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database created" -ForegroundColor Green
} else {
    Write-Host "[INFO] Database might already exist (this is OK)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Enabling PostGIS extension..." -ForegroundColor Yellow
& $psqlPath -U $dbUser -p $dbPort -d $dbName -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] PostGIS enabled" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to enable PostGIS" -ForegroundColor Red
    Write-Host "You may need to install PostGIS extension" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 3: Running migration..." -ForegroundColor Yellow
$migrationsDir = Join-Path $PSScriptRoot "migrations"
if (Test-Path $migrationsDir) {
    $migrationFiles = Get-ChildItem -Path $migrationsDir -Filter "*.sql" | Sort-Object Name
    if ($migrationFiles.Count -eq 0) {
        Write-Host "[ERROR] No migration SQL files found in: $migrationsDir" -ForegroundColor Red
    } else {
        foreach ($file in $migrationFiles) {
            Write-Host "Running migration: $($file.Name)..." -ForegroundColor Yellow
            & $psqlPath -U $dbUser -p $dbPort -d $dbName -f $file.FullName 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[ERROR] Migration failed: $($file.Name)" -ForegroundColor Red
                break
            } else {
                Write-Host "[OK] Migration applied: $($file.Name)" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "[ERROR] Migrations folder not found: $migrationsDir" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 4: Verifying tables..." -ForegroundColor Yellow
& $psqlPath -U $dbUser -p $dbPort -d $dbName -c "\dt" 2>&1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create .env file in backend/ml/ with database credentials" -ForegroundColor White
Write-Host "2. Install dependencies: pip install psycopg2-binary sqlalchemy" -ForegroundColor White
Write-Host "3. Test connection" -ForegroundColor White

# Clear password from environment
Remove-Item Env:\PGPASSWORD



