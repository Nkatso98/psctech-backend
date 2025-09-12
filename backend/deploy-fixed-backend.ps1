# PSC Tech Backend - Deploy Fixed Version
# This script rebuilds and redeploys the backend with the database column mapping fixes

Write-Host "🚀 PSC Tech Backend - Deploying Fixed Version" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "psctech-backend.csproj")) {
    Write-Host "❌ Error: Please run this script from the backend directory" -ForegroundColor Red
    exit 1
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "bin") { Remove-Item -Recurse -Force "bin" }
if (Test-Path "obj") { Remove-Item -Recurse -Force "obj" }
if (Test-Path "publish") { Remove-Item -Recurse -Force "publish" }

# Restore packages
Write-Host "📦 Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to restore packages" -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
dotnet build --configuration Release --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Publish the project
Write-Host "📤 Publishing project..." -ForegroundColor Yellow
dotnet publish --configuration Release --output publish --no-build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publish failed" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = "publish-fixed-$timestamp.zip"

# Use PowerShell to create zip (works on Windows)
try {
    Compress-Archive -Path "publish\*" -DestinationPath $zipPath -Force
    Write-Host "✅ Deployment package created: $zipPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create zip file: $_" -ForegroundColor Red
    exit 1
}

# Deploy to Azure
Write-Host "🚀 Deploying to Azure..." -ForegroundColor Yellow
try {
    az webapp deployment source config-zip `
        --resource-group psctech-rg `
        --name psctech-bcdadbajcrgwa2h5 `
        --src $zipPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host "🌐 Your backend is now available at:" -ForegroundColor Cyan
        Write-Host "   https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net" -ForegroundColor Cyan
        
        # Test the health endpoint
        Write-Host "🧪 Testing backend health..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10  # Wait for deployment to complete
        
        try {
            $response = Invoke-WebRequest -Uri "https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net/api/health" -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend is healthy and responding!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Backend responded with status: $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  Could not test backend health: $_" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Deployment error: $_" -ForegroundColor Red
    exit 1
}

# Cleanup
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
if (Test-Path "publish") { Remove-Item -Recurse -Force "publish" }
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run the database schema script on your Azure SQL database:" -ForegroundColor White
Write-Host "   - Use the create-database-schema.sql file" -ForegroundColor White
Write-Host "2. Test the registration endpoint again" -ForegroundColor White
Write-Host "3. Check the backend logs if issues persist" -ForegroundColor White
