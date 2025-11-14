# PowerShell script to connect to Railway MongoDB
# Usage: .\connect-railway.ps1

Write-Host "Setting up Railway MongoDB connection..." -ForegroundColor Cyan

# Set Railway MongoDB connection string
$env:MONGODB_URI = "mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database"

Write-Host "MONGODB_URI environment variable set!" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  1. Test connection:     node connect-railway-db.js" -ForegroundColor White
Write-Host "  2. Seed family admins:  npm run seed:family-admins" -ForegroundColor White
Write-Host "  3. Seed super admin:    npm run seed:super-admin" -ForegroundColor White
Write-Host "  4. Seed all admins:     npm run seed:all-admins" -ForegroundColor White
Write-Host ""
Write-Host "Running connection test..." -ForegroundColor Cyan
Write-Host ""

node connect-railway-db.js
