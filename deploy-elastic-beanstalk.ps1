# PSCTECH Backend AWS Elastic Beanstalk Deployment Script
# This script deploys the .NET backend to AWS Elastic Beanstalk with Route 53 and SSL

param(
    [string]$Environment = "production",
    [string]$AWSRegion = "eu-north-1",
    [string]$DomainName = "psctech.com",
    [string]$ApiSubdomain = "api",
    [string]$StackName = "psctech-elastic-beanstalk-infrastructure"
)

Write-Host "🚀 Starting PSCTECH Backend AWS Elastic Beanstalk Deployment..." -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "AWS Region: $AWSRegion" -ForegroundColor Yellow
Write-Host "Domain: $DomainName" -ForegroundColor Yellow
Write-Host "API Subdomain: $ApiSubdomain.$DomainName" -ForegroundColor Yellow

# Step 1: Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Blue

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Check if EB CLI is installed
try {
    $ebVersion = eb --version
    Write-Host "✅ EB CLI found: $ebVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ EB CLI not found. Please install EB CLI first." -ForegroundColor Red
    Write-Host "Install with: pip install awsebcli" -ForegroundColor Yellow
    exit 1
}

# Step 2: Configure AWS region
Write-Host "`n🌍 Configuring AWS region..." -ForegroundColor Blue
aws configure set default.region $AWSRegion
Write-Host "✅ AWS region set to: $AWSRegion" -ForegroundColor Green

# Step 3: Get AWS Account ID
Write-Host "`n🔍 Getting AWS Account ID..." -ForegroundColor Blue
$accountId = aws sts get-caller-identity --query Account --output text
Write-Host "✅ AWS Account ID: $accountId" -ForegroundColor Green

# Step 4: Deploy CloudFormation infrastructure
Write-Host "`n☁️ Deploying CloudFormation infrastructure..." -ForegroundColor Blue

# Check if stack exists
try {
    aws cloudformation describe-stacks --stack-name $StackName --region $AWSRegion | Out-Null
    Write-Host "Stack exists, updating..." -ForegroundColor Yellow
    $deployCommand = "update-stack"
} catch {
    Write-Host "Stack doesn't exist, creating..." -ForegroundColor Yellow
    $deployCommand = "create-stack"
}

# Deploy the infrastructure stack
aws cloudformation $deployCommand `
    --stack-name $StackName `
    --template-body file://aws-elastic-beanstalk-configuration.yaml `
    --parameters ParameterKey=Environment,ParameterValue=$Environment ParameterKey=DomainName,ParameterValue=$DomainName ParameterKey=ApiSubdomain,ParameterValue=$ApiSubdomain `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $AWSRegion

if ($deployCommand -eq "create-stack") {
    Write-Host "`n⏳ Waiting for stack creation to complete..." -ForegroundColor Blue
    aws cloudformation wait stack-create-complete --stack-name $StackName --region $AWSRegion
} else {
    Write-Host "`n⏳ Waiting for stack update to complete..." -ForegroundColor Blue
    aws cloudformation wait stack-update-complete --stack-name $StackName --region $AWSRegion
}

Write-Host "✅ CloudFormation stack deployed successfully" -ForegroundColor Green

# Step 5: Get stack outputs
Write-Host "`n📊 Getting infrastructure outputs..." -ForegroundColor Blue
$outputs = aws cloudformation describe-stacks --stack-name $StackName --region $AWSRegion --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json

$ebAppName = ($outputs | Where-Object { $_.OutputKey -eq "ElasticBeanstalkApplicationName" }).OutputValue
$ebEnvName = ($outputs | Where-Object { $_.OutputKey -eq "ElasticBeanstalkEnvironmentName" }).OutputValue
$apiDomain = ($outputs | Where-Object { $_.OutputKey -eq "ApiDomainName" }).OutputValue

Write-Host "✅ Elastic Beanstalk Application: $ebAppName" -ForegroundColor Green
Write-Host "✅ Elastic Beanstalk Environment: $ebEnvName" -ForegroundColor Green
Write-Host "✅ API Domain: $apiDomain" -ForegroundColor Green

# Step 6: Build and package the application
Write-Host "`n🔨 Building .NET application..." -ForegroundColor Blue

# Navigate to backend directory
Push-Location backend

# Restore packages
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to restore packages" -ForegroundColor Red
    exit 1
}

# Build the application
dotnet build -c Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build application" -ForegroundColor Red
    exit 1
}

# Publish the application
dotnet publish -c Release -o ../publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to publish application" -ForegroundColor Red
    exit 1
}

Pop-Location

Write-Host "✅ Application built and published successfully" -ForegroundColor Green

# Step 7: Create deployment package
Write-Host "`n📦 Creating deployment package..." -ForegroundColor Blue

# Create deployment directory
$deployDir = "deploy-package"
if (Test-Path $deployDir) {
    Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy published files
Copy-Item "publish/*" -Destination $deployDir -Recurse

# Copy Elastic Beanstalk configuration
Copy-Item ".ebextensions" -Destination $deployDir -Recurse

# Create deployment package
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageName = "psctech-backend-$timestamp.zip"

# Create ZIP file
Compress-Archive -Path "$deployDir/*" -DestinationPath $packageName -Force

Write-Host "✅ Deployment package created: $packageName" -ForegroundColor Green

# Step 8: Deploy to Elastic Beanstalk
Write-Host "`n🚀 Deploying to Elastic Beanstalk..." -ForegroundColor Blue

# Initialize EB CLI if not already done
if (-not (Test-Path ".elasticbeanstalk")) {
    Write-Host "Initializing EB CLI..." -ForegroundColor Yellow
    eb init $ebAppName --region $AWSRegion --platform "dotnet-core-linux" --instance-type t3.small
}

# Deploy the application
eb deploy $ebEnvName --staged --timeout 20
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy to Elastic Beanstalk" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Application deployed to Elastic Beanstalk successfully" -ForegroundColor Green

# Step 9: Wait for deployment to complete
Write-Host "`n⏳ Waiting for deployment to complete..." -ForegroundColor Blue
Start-Sleep -Seconds 30

# Step 10: Get environment status
Write-Host "`n📊 Getting environment status..." -ForegroundColor Blue
$envStatus = aws elasticbeanstalk describe-environments --environment-names $ebEnvName --region $AWSRegion --query 'Environments[0].Status' --output text
$envHealth = aws elasticbeanstalk describe-environments --environment-names $ebEnvName --region $AWSRegion --query 'Environments[0].Health' --output text

Write-Host "Environment Status: $envStatus" -ForegroundColor Cyan
Write-Host "Environment Health: $envHealth" -ForegroundColor Cyan

# Step 11: Test the deployment
Write-Host "`n🧪 Testing the deployment..." -ForegroundColor Blue

# Get the environment URL
$envUrl = aws elasticbeanstalk describe-environments --environment-names $ebEnvName --region $AWSRegion --query 'Environments[0].CNAME' --output text
$testUrl = "https://$envUrl/health"

Write-Host "Testing health endpoint: $testUrl" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $testUrl -Method GET -TimeoutSec 30
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️ Health check failed. The service might still be starting up." -ForegroundColor Yellow
    Write-Host "Please wait a few minutes and try again." -ForegroundColor Yellow
}

# Step 12: Test API domain
Write-Host "`n🔗 Testing API domain..." -ForegroundColor Blue
$apiTestUrl = "$apiDomain/health"
Write-Host "Testing API domain: $apiTestUrl" -ForegroundColor Yellow

try {
    $apiResponse = Invoke-RestMethod -Uri $apiTestUrl -Method GET -TimeoutSec 30
    Write-Host "✅ API domain test passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ API domain test failed. DNS propagation might take a few minutes." -ForegroundColor Yellow
}

# Step 13: Cleanup
Write-Host "`n🧹 Cleaning up..." -ForegroundColor Blue
Remove-Item $deployDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $packageName -Force -ErrorAction SilentlyContinue
Remove-Item "publish" -Recurse -Force -ErrorAction SilentlyContinue

# Step 14: Final summary
Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "`n📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host "Region: $AWSRegion" -ForegroundColor White
Write-Host "Elastic Beanstalk App: $ebAppName" -ForegroundColor White
Write-Host "Elastic Beanstalk Environment: $ebEnvName" -ForegroundColor White
Write-Host "Environment URL: https://$envUrl" -ForegroundColor White
Write-Host "API Domain: $apiDomain" -ForegroundColor White
Write-Host "Health Check: $testUrl" -ForegroundColor White

Write-Host "`n🔗 API Endpoints:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Health Check: $apiDomain/health" -ForegroundColor Green
Write-Host "Authentication: $apiDomain/api/auth/login" -ForegroundColor Green
Write-Host "Institution Registration: $apiDomain/api/institution" -ForegroundColor Green
Write-Host "Study Results: $apiDomain/api/study/results" -ForegroundColor Green
Write-Host "Vouchers: $apiDomain/api/vouchers" -ForegroundColor Green

Write-Host "`n🧪 Demo Credentials:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Principal: principal@demoschool.com / password123" -ForegroundColor White
Write-Host "Teacher: teacher@demoschool.com / password123" -ForegroundColor White
Write-Host "Parent: parent@demoschool.com / password123" -ForegroundColor White
Write-Host "Learner: learner@demoschool.com / password123" -ForegroundColor White

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Update your frontend to use: $apiDomain" -ForegroundColor White
Write-Host "2. Test all PSCTECH features with the demo credentials" -ForegroundColor White
Write-Host "3. Monitor the application in AWS Console" -ForegroundColor White
Write-Host "4. Set up CloudWatch alarms for monitoring" -ForegroundColor White
Write-Host "5. Configure auto-scaling policies if needed" -ForegroundColor White

Write-Host "`n🚀 PSCTECH Backend is now deployed on AWS Elastic Beanstalk!" -ForegroundColor Green
Write-Host "Your application is accessible at: $apiDomain" -ForegroundColor Green








