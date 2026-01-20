# Quick IP Update Script
# Usage: .\update-ip.ps1 [IP] (or auto-detect)

param([string]$NewIP = $null)

if (-not $NewIP) {
    # Auto-detect
    $ipconfig = ipconfig | Select-String -Pattern "IPv4.*192\.168\.\d+\.\d+" | Select-Object -First 1
    if ($ipconfig) {
        $NewIP = ($ipconfig -split ':')[1].Trim()
        Write-Host "Auto-detected IP: $NewIP" -ForegroundColor Green
    } else {
        Write-Host "Please provide IP: .\update-ip.ps1 192.168.1.14" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Updating IP to: $NewIP" -ForegroundColor Cyan

$files = @(
    "frontend\mobile\src\services\api.ts",
    "frontend\mobile\src\services\websocket.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace 'http://192\.168\.\d+\.\d+:3001', "http://${NewIP}:3001"
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    }
}

Write-Host "Done! Reload your app." -ForegroundColor Green
