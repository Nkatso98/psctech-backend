# Deploy PSC Tech Backend to Azure with Fixed Authentication
# This script deploys the backend with the enhanced authentication system

param(
    [string]$ResourceGroupName = "psctech",
    [string]$AppServiceName = "psctech-bcdadbajcrgwa2h5",
    [string]$ProjectPath = ".",
    [string]$Configuration = "Release"
)

Write-Host "🚀 Starting PSC Tech Backend Deployment to Azure..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    exit 1
}

# Check if logged in to Azure
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

# Set the subscription
Write-Host "📋 Setting subscription..." -ForegroundColor Yellow
az account set --subscription "497bfc4c-1b93-4146-984e-f178d3837bab"

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "bin") { Remove-Item "bin" -Recurse -Force }
if (Test-Path "obj") { Remove-Item "obj" -Recurse -Force }

# Restore packages
Write-Host "📦 Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
dotnet build --configuration $Configuration --no-restore

# Publish the project
Write-Host "📤 Publishing project..." -ForegroundColor Yellow
dotnet publish --configuration $Configuration --output "publish-fixed-auth" --no-build

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$deploymentZip = "deploy-fixed-auth-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Compress-Archive -Path "publish-fixed-auth\*" -DestinationPath $deploymentZip -Force

# Deploy to Azure App Service
Write-Host "🚀 Deploying to Azure App Service..." -ForegroundColor Yellow
try {
    az webapp deployment source config-zip `
        --resource-group $ResourceGroupName `
        --name $AppServiceName `
        --src $deploymentZip `
        --output json | ConvertFrom-Json

    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean up deployment files
Write-Host "🧹 Cleaning up deployment files..." -ForegroundColor Yellow
Remove-Item $deploymentZip -Force
Remove-Item "publish-fixed-auth" -Recurse -Force

# Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
$appUrl = "https://$AppServiceName.azurewebsites.net"
$healthUrl = "$appUrl/api/health"

try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 30
    Write-Host "✅ Health check passed: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Display deployment information
Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Green
Write-Host "   App Service: $AppServiceName" -ForegroundColor White
Write-Host "   Resource Group: $ResourceGroupName" -ForegroundColor White
Write-Host "   URL: $appUrl" -ForegroundColor White
Write-Host "   Swagger: $appUrl/swagger" -ForegroundColor White
Write-Host "   Health Check: $healthUrl" -ForegroundColor White

Write-Host "`n🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Run the database schema fix script" -ForegroundColor White
Write-Host "   2. Test the authentication endpoints" -ForegroundColor White
Write-Host "   3. Deploy the frontend to Firebase" -ForegroundColor White

Write-Host "`n📋 Database Schema Fix:" -ForegroundColor Cyan
Write-Host "   Run the SQL script: fix-user-table-schema.sql" -ForegroundColor White
Write-Host "   This will add the missing password fields to the Users table" -ForegroundColor White
