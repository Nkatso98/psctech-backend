# PSC Tech Backend Azure Deployment Script
# This script deploys the .NET Core backend to Azure App Service

Write-Host "🚀 PSC Tech Backend Azure Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Configuration
$ResourceGroup = "psctech"
$AppServiceName = "psctech"
$PublishOutput = "./publish"
$ZipFile = "./publish.zip"

# Check if Azure CLI is installed
try {
    $azVersion = az --version
    Write-Host "✅ Azure CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if logged in to Azure
try {
    $account = az account show --query name -o tsv
    Write-Host "✅ Logged in to Azure: $account" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path $PublishOutput) {
    Remove-Item -Path $PublishOutput -Recurse -Force
}
if (Test-Path $ZipFile) {
    Remove-Item -Path $ZipFile -Force
}

# Build the application
Write-Host "🔨 Building .NET Core application..." -ForegroundColor Yellow
dotnet build --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Publish the application
Write-Host "📦 Publishing application..." -ForegroundColor Yellow
dotnet publish --configuration Release --output $PublishOutput
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publish failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Publish completed successfully" -ForegroundColor Green

# Create deployment zip
Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path "$PublishOutput/*" -DestinationPath $ZipFile -Force
if (-not (Test-Path $ZipFile)) {
    Write-Host "❌ Failed to create zip file!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployment package created" -ForegroundColor Green

# Deploy to Azure
Write-Host "🚀 Deploying to Azure App Service..." -ForegroundColor Yellow
az webapp deploy --resource-group $ResourceGroup --name $AppServiceName --src-path $ZipFile --type zip
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green

# Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
$appUrl = "https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net"
try {
    $response = Invoke-WebRequest -Uri "$appUrl/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed: $($response.Content)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Cleanup
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Path $PublishOutput -Recurse -Force
Remove-Item -Path $ZipFile -Force

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: $appUrl" -ForegroundColor Cyan
Write-Host "📊 Azure Portal: https://portal.azure.com/#@sogoniraphaelgmail.onmicrosoft.com/resource/subscriptions/497bfc4c-1b93-4146-984e-f178d3837bab/resourceGroups/psctech/providers/Microsoft.Web/sites/psctech" -ForegroundColor Cyan
