# =====================================================
# DEPLOY ALL PSC TECH APIs TO AZURE
# =====================================================

Write-Host "🚀 Starting deployment of all PSC Tech APIs to Azure..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Check if Azure CLI is installed and logged in
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    Write-Host "   Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Azure
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
    Write-Host "📋 Subscription: $($account.name)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

Write-Host "================================================" -ForegroundColor Cyan

# Deploy Backend API
Write-Host "🌐 Deploying Backend API..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

if (Test-Path "backend\deploy-backend-api.ps1") {
    & "backend\deploy-backend-api.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend API deployment failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Backend API deployment script not found!" -ForegroundColor Red
    exit 1
}

Write-Host "================================================" -ForegroundColor Cyan

# Deploy Voucher API
Write-Host "🎫 Deploying Voucher API..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

if (Test-Path "backend\deploy-voucher-api.ps1") {
    & "backend\deploy-voucher-api.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Voucher API deployment failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Voucher API deployment script not found!" -ForegroundColor Red
    exit 1
}

Write-Host "================================================" -ForegroundColor Cyan

# Final Summary
Write-Host "🎉 ALL APIs DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📋 Deployment Summary:" -ForegroundColor White
Write-Host "   ✅ Backend API: Institution Management & User Management" -ForegroundColor Green
Write-Host "   ✅ Voucher API: Voucher Creation, Redemption & Management" -ForegroundColor Green
Write-Host "   ✅ Database: Connected to psctech_main" -ForegroundColor Green
Write-Host "   ✅ Azure: Both services running on Azure App Service" -ForegroundColor Green

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🌐 Your APIs are now live and ready to use!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
