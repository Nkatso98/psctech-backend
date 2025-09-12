p# Azure App Service Deployment Script for PSC
# Run this from the backend directory

Write-Host "🚀 Deploying PSC Tech Backend to Azure..." -ForegroundColor Green

# Remove node_modules and create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" }
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }

# Install production dependencies
Write-Host "📥 Installing production dependencies..." -ForegroundColor Yellow
npm install --production

# Create deployment zip
Write-Host "🗜️ Creating deployment package..." -ForegroundColor Yellow
Compress-Archive -Path "api", "config", "package.json", "package-lock.json", "web.config", ".env" -DestinationPath "deploy.zip"

Write-Host "✅ Deployment package created: deploy.zip" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to Azure Portal > App Service > psctech-bcdadbajcrgwa2h5" -ForegroundColor White
Write-Host "2. Go to Deployment Center" -ForegroundColor White
Write-Host "3. Choose 'Manual deployment'" -ForegroundColor White
Write-Host "4. Upload deploy.zip" -ForegroundColor White
Write-Host "5. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your backend will be available at:" -ForegroundColor Cyan
Write-Host "   https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net" -ForegroundColor White

shb
