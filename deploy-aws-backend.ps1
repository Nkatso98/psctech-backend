# PSCTECH Backend AWS Deployment Script
# This script builds, pushes, and deploys the .NET backend to AWS ECS

param(
    [string]$Environment = "production",
    [string]$AWSRegion = "eu-north-1",
    [string]$ECRRepositoryName = "psctech-backend",
    [string]$StackName = "psctech-backend-infrastructure"
)

Write-Host "🚀 Starting PSCTECH Backend AWS Deployment..." -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "AWS Region: $AWSRegion" -ForegroundColor Yellow

# Step 1: Check AWS CLI and Docker
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Blue

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI found: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
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

# Step 4: Create ECR repository if it doesn't exist
Write-Host "`n📦 Setting up ECR repository..." -ForegroundColor Blue
try {
    aws ecr describe-repositories --repository-names $ECRRepositoryName --region $AWSRegion | Out-Null
    Write-Host "✅ ECR repository already exists: $ECRRepositoryName" -ForegroundColor Green
} catch {
    Write-Host "Creating ECR repository: $ECRRepositoryName" -ForegroundColor Yellow
    aws ecr create-repository --repository-name $ECRRepositoryName --region $AWSRegion
    Write-Host "✅ ECR repository created: $ECRRepositoryName" -ForegroundColor Green
}

# Step 5: Get ECR login token
Write-Host "`n🔐 Getting ECR login token..." -ForegroundColor Blue
aws ecr get-login-password --region $AWSRegion | docker login --username AWS --password-stdin $accountId.dkr.ecr.$AWSRegion.amazonaws.com
Write-Host "✅ ECR login successful" -ForegroundColor Green

# Step 6: Build Docker image
Write-Host "`n🔨 Building Docker image..." -ForegroundColor Blue
$imageTag = "$accountId.dkr.ecr.$AWSRegion.amazonaws.com/$ECRRepositoryName`:latest"
docker build -t $ECRRepositoryName .
Write-Host "✅ Docker image built locally" -ForegroundColor Green

# Step 7: Tag and push image to ECR
Write-Host "`n📤 Tagging and pushing image to ECR..." -ForegroundColor Blue
docker tag $ECRRepositoryName`:latest $imageTag
docker push $imageTag
Write-Host "✅ Docker image pushed to ECR: $imageTag" -ForegroundColor Green

# Step 8: Deploy CloudFormation stack
Write-Host "`n☁️ Deploying CloudFormation stack..." -ForegroundColor Blue

# Check if stack exists
try {
    aws cloudformation describe-stacks --stack-name $StackName --region $AWSRegion | Out-Null
    Write-Host "Stack exists, updating..." -ForegroundColor Yellow
    $deployCommand = "update-stack"
} catch {
    Write-Host "Stack doesn't exist, creating..." -ForegroundColor Yellow
    $deployCommand = "create-stack"
}

# Deploy the stack
aws cloudformation $deployCommand `
    --stack-name $StackName `
    --template-body file://aws-backend-infrastructure.yaml `
    --parameters ParameterKey=Environment,ParameterValue=$Environment `
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

# Step 9: Get stack outputs
Write-Host "`n📊 Getting deployment outputs..." -ForegroundColor Blue
$outputs = aws cloudformation describe-stacks --stack-name $StackName --region $AWSRegion --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json

Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "`n📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

foreach ($output in $outputs) {
    Write-Host "$($output.OutputKey): $($output.OutputValue)" -ForegroundColor White
}

Write-Host "`n🔗 API Endpoints:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Find API Gateway URL
$apiUrl = ($outputs | Where-Object { $_.OutputKey -eq "ApiGatewayUrl" }).OutputValue
if ($apiUrl) {
    Write-Host "API Gateway URL: $apiUrl" -ForegroundColor Green
}

# Find ALB DNS
$albDns = ($outputs | Where-Object { $_.OutputKey -eq "ALBDNSName" }).OutputValue
if ($albDns) {
    Write-Host "Load Balancer DNS: $albDns" -ForegroundColor Green
}

# Find domain name
$domainName = ($outputs | Where-Object { $_.OutputKey -eq "DomainName" }).OutputValue
if ($domainName -and $domainName -ne "No domain configured") {
    Write-Host "Custom Domain: $domainName" -ForegroundColor Green
}

Write-Host "`n🧪 Testing the deployment..." -ForegroundColor Blue

# Test health endpoint
$testUrl = if ($apiUrl) { "$apiUrl/health" } else { "http://$albDns/health" }
Write-Host "Testing health endpoint: $testUrl" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $testUrl -Method GET -TimeoutSec 10
    Write-Host "✅ Health check passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Health check failed. The service might still be starting up." -ForegroundColor Yellow
    Write-Host "Please wait a few minutes and try again." -ForegroundColor Yellow
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Update your frontend to use the new API endpoint" -ForegroundColor White
Write-Host "2. Test all PSCTECH features with the demo credentials" -ForegroundColor White
Write-Host "3. Monitor the application in AWS CloudWatch" -ForegroundColor White
Write-Host "4. Set up custom domain and SSL certificate if needed" -ForegroundColor White

Write-Host "`n🚀 PSCTECH Backend is now deployed on AWS!" -ForegroundColor Green








