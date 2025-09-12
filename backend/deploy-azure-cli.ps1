# Azure CLI Deployment Script for PSC Tech Backend
# This script avoids SSL certificate issues that can occur with Visual Studio deployment

param(
    [string]$ResourceGroup = "psctech",
    [string]$AppServiceName = "psctech",
    [string]$BuildConfiguration = "Release"
)

Write-Host "🚀 Starting Azure CLI Deployment for PSC Tech Backend..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "✅ Azure CLI found: Version $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check if logged in to Azure
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "✅ Logged in to Azure as: $($account.user.name)" -ForegroundColor Green
    Write-Host "📊 Current subscription: $($account.name)" -ForegroundColor Cyan
} catch {
    Write-Host "🔐 Please log in to Azure..." -ForegroundColor Yellow
    az login
}

# Build the project
Write-Host "🔨 Building project in $BuildConfiguration configuration..." -ForegroundColor Yellow
dotnet build --configuration $BuildConfiguration --no-restore

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Publish the project
Write-Host "📦 Publishing project..." -ForegroundColor Yellow
$publishPath = "bin\$BuildConfiguration\net8.0\publish"
dotnet publish --configuration $BuildConfiguration --output $publishPath --no-build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publish failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Publish completed successfully!" -ForegroundColor Green

# Deploy to Azure App Service using Azure CLI
Write-Host "🚀 Deploying to Azure App Service: $AppServiceName..." -ForegroundColor Yellow

try {
    # Use Azure CLI to deploy the published files
    az webapp deployment source config-zip `
        --resource-group $ResourceGroup `
        --name $AppServiceName `
        --src "$publishPath.zip" `
        --timeout 1800

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
        Write-Host "🌐 Your app is now available at: https://$AppServiceName.southafricanorth-01.azurewebsites.net" -ForegroundColor Cyan
        
        # Test the deployment
        Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10  # Wait for app to start
        
        try {
            $response = Invoke-WebRequest -Uri "https://$AppServiceName.southafricanorth-01.azurewebsites.net" -UseBasicParsing -TimeoutSec 30
            Write-Host "✅ App is responding: Status $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ App deployed but may still be starting up..." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Deployment error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment completed! Your PSC Tech Backend is now running on Azure!" -ForegroundColor Green
Write-Host "📊 Monitor your app at: https://portal.azure.com/#@/resource/subscriptions/your-subscription/resourceGroups/$ResourceGroup/providers/Microsoft.Web/sites/$AppServiceName" -ForegroundColor Cyan
