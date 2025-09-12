@echo off
echo 🚀 PSC Tech Backend Azure Deployment
echo =====================================

REM Configuration
set RESOURCE_GROUP=psctech
set APP_SERVICE_NAME=psctech
set PUBLISH_OUTPUT=./publish
set ZIP_FILE=./publish.zip

REM Check if Azure CLI is installed
az --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Azure CLI not found. Please install it first.
    pause
    exit /b 1
)
echo ✅ Azure CLI found

REM Check if logged in to Azure
az account show >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Azure. Please run 'az login' first.
    pause
    exit /b 1
)
echo ✅ Logged in to Azure

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "%PUBLISH_OUTPUT%" rmdir /s /q "%PUBLISH_OUTPUT%"
if exist "%ZIP_FILE%" del "%ZIP_FILE%"

REM Build the application
echo 🔨 Building .NET Core application...
dotnet build --configuration Release
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build completed successfully

REM Publish the application
echo 📦 Publishing application...
dotnet publish --configuration Release --output %PUBLISH_OUTPUT%
if %errorlevel% neq 0 (
    echo ❌ Publish failed!
    pause
    exit /b 1
)
echo ✅ Publish completed successfully

REM Create deployment zip
echo 📁 Creating deployment package...
powershell -Command "Compress-Archive -Path '%PUBLISH_OUTPUT%\*' -DestinationPath '%ZIP_FILE%' -Force"
if not exist "%ZIP_FILE%" (
    echo ❌ Failed to create zip file!
    pause
    exit /b 1
)
echo ✅ Deployment package created

REM Deploy to Azure
echo 🚀 Deploying to Azure App Service...
az webapp deploy --resource-group %RESOURCE_GROUP% --name %APP_SERVICE_NAME% --src-path %ZIP_FILE% --type zip
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)
echo ✅ Deployment completed successfully!

REM Cleanup
echo 🧹 Cleaning up temporary files...
if exist "%PUBLISH_OUTPUT%" rmdir /s /q "%PUBLISH_OUTPUT%"
if exist "%ZIP_FILE%" del "%ZIP_FILE%"

echo.
echo 🎉 Deployment completed successfully!
echo 🌐 Your app is available at: https://psctech-bcdadbajcrgwa2h5.southafricanorth-01.azurewebsites.net
echo 📊 Azure Portal: https://portal.azure.com/#@sogoniraphaelgmail.onmicrosoft.com/resource/subscriptions/497bfc4c-1b93-4146-984e-f178d3837bab/resourceGroups/psctech/providers/Microsoft.Web/sites/psctech
pause
