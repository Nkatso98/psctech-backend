# Deploy PSC Tech Frontend to Firebase
# This script builds and deploys the React frontend to Firebase Hosting

param(
    [string]$FirebaseProject = "psctech-2f998",
    [string]$BuildOutput = "dist"
)

Write-Host "🚀 Starting PSC Tech Frontend Deployment to Firebase..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm version: $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI version: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

# Login to Firebase
Write-Host "🔐 Logging in to Firebase..." -ForegroundColor Yellow
try {
    firebase login --no-localhost
    Write-Host "✅ Firebase login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Set Firebase project
Write-Host "📋 Setting Firebase project..." -ForegroundColor Yellow
firebase use $FirebaseProject

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path $BuildOutput) { Remove-Item $BuildOutput -Recurse -Force }
if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
pnpm run build

# Check if build was successful
if (-not (Test-Path $BuildOutput)) {
    Write-Host "❌ Build failed. Build output directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase Hosting..." -ForegroundColor Yellow
try {
    firebase deploy --only hosting --project $FirebaseProject
    Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get deployment URL
Write-Host "🔍 Getting deployment information..." -ForegroundColor Yellow
try {
    $deploymentInfo = firebase hosting:sites:list --project $FirebaseProject --json
    $siteUrl = ($deploymentInfo | ConvertFrom-Json).defaultUrl
    
    Write-Host "`n🎉 Deployment Summary:" -ForegroundColor Green
    Write-Host "   Firebase Project: $FirebaseProject" -ForegroundColor White
    Write-Host "   Site URL: $siteUrl" -ForegroundColor White
    Write-Host "   Build Output: $BuildOutput" -ForegroundColor White
    
    Write-Host "`n🔧 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Test the deployed frontend" -ForegroundColor White
    Write-Host "   2. Update API endpoints to use the new backend URL" -ForegroundColor White
    Write-Host "   3. Test authentication flow" -ForegroundColor White
    
    Write-Host "`n📋 Important URLs:" -ForegroundColor Cyan
    Write-Host "   Frontend: $siteUrl" -ForegroundColor White
    Write-Host "   Backend API: https://psctech-bcdadbajcrgwa2h5.azurewebsites.net" -ForegroundColor White
    Write-Host "   Backend Swagger: https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/swagger" -ForegroundColor White
    
} catch {
    Write-Host "⚠️ Could not retrieve deployment information: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`nFrontend deployment completed!" -ForegroundColor Green
