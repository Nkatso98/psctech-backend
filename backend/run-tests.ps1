# PSC Tech Voucher System Test Runner (PowerShell)
Write-Host "🚀 Starting PSC Tech Voucher System Tests..." -ForegroundColor Green

# Set environment variables
$env:NODE_ENV = "test"
$env:TEST_DATABASE = "psctech_test"

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Create test database if it doesn't exist
Write-Host "🗄️ Setting up test database..." -ForegroundColor Cyan
Write-Host "Note: Ensure Azure SQL test database 'psctech_test' exists" -ForegroundColor Yellow

# Run database setup scripts
Write-Host "🔧 Running database setup scripts..." -ForegroundColor Cyan
Write-Host "Please run the following SQL scripts in Azure SQL:" -ForegroundColor Yellow
Write-Host "1. azure-sql-deployment/01-create-master-database.sql" -ForegroundColor White
Write-Host "2. azure-sql-deployment/02-create-institution-database.sql" -ForegroundColor White

# Run tests
Write-Host "🧪 Running voucher system tests..." -ForegroundColor Green
npm run test:voucher

# Check test results
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tests passed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Check the output above for details." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Test run completed!" -ForegroundColor Green


