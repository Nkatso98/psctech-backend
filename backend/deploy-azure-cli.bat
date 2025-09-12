@echo off
REM Azure CLI Deployment Script for PSC Tech Backend
REM This script avoids SSL certificate issues that can occur with Visual Studio deployment

set RESOURCE_GROUP=psctech
set APP_SERVICE_NAME=psctech
set BUILD_CONFIG=Release

echo 🚀 Starting Azure CLI Deployment for PSC Tech Backend...

REM Check if Azure CLI is installed
az version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Azure CLI not found. Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
    pause
    exit /b 1
)

REM Check if logged in to Azure
az account show >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Azure...
    az login
)

REM Build the project
echo 🔨 Building project in %BUILD_CONFIG% configuration...
dotnet build --configuration %BUILD_CONFIG% --no-restore
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build completed successfully!

REM Publish the project
echo 📦 Publishing project...
set PUBLISH_PATH=bin\%BUILD_CONFIG%\net8.0\publish
dotnet publish --configuration %BUILD_CONFIG% --output %PUBLISH_PATH% --no-build
if %errorlevel% neq 0 (
    echo ❌ Publish failed!
    pause
    exit /b 1
)
echo ✅ Publish completed successfully!

REM Deploy to Azure App Service using Azure CLI
echo 🚀 Deploying to Azure App Service: %APP_SERVICE_NAME%...

REM Create zip file for deployment
powershell -Command "Compress-Archive -Path '%PUBLISH_PATH%\*' -DestinationPath '%PUBLISH_PATH%.zip' -Force"

REM Deploy using Azure CLI
az webapp deployment source config-zip --resource-group %RESOURCE_GROUP% --name %APP_SERVICE_NAME% --src "%PUBLISH_PATH%.zip" --timeout 1800

if %errorlevel% equ 0 (
    echo ✅ Deployment completed successfully!
    echo 🌐 Your app is now available at: https://%APP_SERVICE_NAME%.southafricanorth-01.azurewebsites.net
    
    echo 🧪 Testing deployment...
    timeout /t 10 /nobreak >nul
    
    echo 🎉 Deployment completed! Your PSC Tech Backend is now running on Azure!
    echo 📊 Monitor your app at: https://portal.azure.com/#@/resource/subscriptions/your-subscription/resourceGroups/%RESOURCE_GROUP%/providers/Microsoft.Web/sites/%APP_SERVICE_NAME%
) else (
    echo ❌ Deployment failed!
)

pause
