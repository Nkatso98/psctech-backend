# =====================================================
# DEPLOY BACKEND API TO AZURE APP SERVICE
# =====================================================

Write-Host "🚀 Starting Backend API deployment to Azure..." -ForegroundColor Green

# Configuration
$resourceGroup = "psctech-rg"
$appServiceName = "psctech-bcdadbajcrgwa2h5"
$location = "South Africa North"
$runtime = "dotnet:8.0"
$zipPath = "backend-api-deploy.zip"

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Resource Group: $resourceGroup" -ForegroundColor White
Write-Host "   App Service: $appServiceName" -ForegroundColor White
Write-Host "   Location: $location" -ForegroundColor White
Write-Host "   Runtime: $runtime" -ForegroundColor White

# Check if Azure CLI is installed and logged in
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

# Set subscription if needed
Write-Host "📋 Current subscription: $($account.name)" -ForegroundColor Yellow

# Check if resource group exists
Write-Host "🔍 Checking resource group..." -ForegroundColor Yellow
$rgExists = az group exists --name $resourceGroup --output tsv
if ($rgExists -eq "false") {
    Write-Host "❌ Resource group '$resourceGroup' does not exist. Creating..." -ForegroundColor Yellow
    az group create --name $resourceGroup --location $location
    Write-Host "✅ Resource group created successfully" -ForegroundColor Green
} else {
    Write-Host "✅ Resource group '$resourceGroup' exists" -ForegroundColor Green
}

# Check if App Service exists
Write-Host "🔍 Checking App Service..." -ForegroundColor Yellow
$appServiceExists = az webapp list --resource-group $resourceGroup --query "[?name=='$appServiceName'].name" --output tsv
if ([string]::IsNullOrEmpty($appServiceExists)) {
    Write-Host "❌ App Service '$appServiceName' does not exist. Creating..." -ForegroundColor Yellow
    
    # Create App Service Plan if it doesn't exist
    $planName = "$resourceGroup-plan"
    $planExists = az appservice plan list --resource-group $resourceGroup --query "[?name=='$planName'].name" --output tsv
    if ([string]::IsNullOrEmpty($planExists)) {
        Write-Host "📋 Creating App Service Plan..." -ForegroundColor Yellow
        az appservice plan create --name $planName --resource-group $resourceGroup --location $location --sku B1 --is-linux
        Write-Host "✅ App Service Plan created" -ForegroundColor Green
    } else {
        Write-Host "✅ App Service Plan exists" -ForegroundColor Green
    }
    
    # Create App Service
    az webapp create --resource-group $resourceGroup --plan $planName --name $appServiceName --runtime $runtime
    Write-Host "✅ App Service created successfully" -ForegroundColor Green
} else {
    Write-Host "✅ App Service '$appServiceName' exists" -ForegroundColor Green
}

# Build the project
Write-Host "🔨 Building Backend API project..." -ForegroundColor Yellow
Set-Location backend
dotnet clean
dotnet restore
dotnet build --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Publish the project
Write-Host "📦 Publishing Backend API..." -ForegroundColor Yellow
dotnet publish --configuration Release --output publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publish failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Publish completed successfully" -ForegroundColor Green

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}
Compress-Archive -Path "publish\*" -DestinationPath $zipPath -Force
Write-Host "✅ Deployment package created: $zipPath" -ForegroundColor Green

# Deploy to Azure
Write-Host "🚀 Deploying to Azure App Service..." -ForegroundColor Yellow
az webapp deployment source config-zip --resource-group $resourceGroup --name $appServiceName --src $zipPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green

# Get the App Service URL
$appServiceUrl = az webapp show --resource-group $resourceGroup --name $appServiceName --query "defaultHostName" --output tsv
$fullUrl = "https://$appServiceUrl"

Write-Host "🌐 Backend API deployed successfully!" -ForegroundColor Green
Write-Host "   URL: $fullUrl" -ForegroundColor White
Write-Host "   Health Check: $fullUrl/health" -ForegroundColor White
Write-Host "   API Docs: $fullUrl/swagger" -ForegroundColor White

# Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$fullUrl/health" -UseBasicParsing -TimeoutSec 30
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Health check returned status: $($healthResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Clean up
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
Set-Location ..
Remove-Item "backend\$zipPath" -Force -ErrorAction SilentlyContinue
Remove-Item "backend\publish" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🎉 Backend API deployment completed!" -ForegroundColor Green
Write-Host "   Your API is now live at: $fullUrl" -ForegroundColor White
