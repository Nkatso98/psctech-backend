# PSCTECH Backend AWS Deployment Guide

## 🚀 Overview

This guide will help you deploy your PSCTECH backend to AWS using a modern, scalable architecture with API Gateway, ECS Fargate, and Application Load Balancer.

## 📋 Prerequisites

### Required Tools
- **AWS CLI** - [Install here](https://aws.amazon.com/cli/)
- **Docker Desktop** - [Install here](https://www.docker.com/products/docker-desktop/)
- **PowerShell** (Windows) or **Bash** (Linux/Mac)

### AWS Account Setup
1. **Create AWS Account** - [Sign up here](https://aws.amazon.com/)
2. **Configure AWS CLI**:
   ```bash
   aws configure
   ```
   Enter your:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `eu-north-1`
   - Default output format: `json`

3. **Required AWS Permissions**:
   - CloudFormation (Full Access)
   - ECS (Full Access)
   - ECR (Full Access)
   - IAM (Limited - for creating roles)
   - VPC (Full Access)
   - API Gateway (Full Access)
   - Route 53 (if using custom domain)

## 🏗️ Architecture

```
Internet → API Gateway → Application Load Balancer → ECS Fargate → .NET Backend
                                    ↓
                              RDS SQL Server
```

### Components
- **API Gateway**: Provides HTTPS endpoint and request routing
- **Application Load Balancer**: Load balancing and health checks
- **ECS Fargate**: Serverless container hosting
- **RDS SQL Server**: Multi-tenant database (already configured)
- **VPC**: Network isolation and security
- **CloudWatch**: Logging and monitoring

## 📁 Files Overview

### Infrastructure Files
- `aws-backend-infrastructure.yaml` - CloudFormation template
- `Dockerfile` - Container configuration
- `deploy-aws-backend.ps1` - Deployment script

### Backend Files
- `backend/appsettings.json` - Updated for AWS
- `backend/Controllers/HealthController.cs` - Health check endpoint

## 🚀 Deployment Steps

### Step 1: Prepare Your Environment

1. **Clone/Download** your PSCTECH project
2. **Navigate** to the project directory
3. **Ensure** all files are in place

### Step 2: Run Database Setup Scripts

First, set up your databases using the scripts we created earlier:

```sql
-- Run these in your AWS RDS SQL Server instance
-- 1. setup-psctech-databases.sql
-- 2. apply-tenant-schemas.sql
```

### Step 3: Deploy to AWS

Run the deployment script:

```powershell
# For production
.\deploy-aws-backend.ps1 -Environment production

# For development
.\deploy-aws-backend.ps1 -Environment development
```

The script will:
1. ✅ Check prerequisites (AWS CLI, Docker)
2. ✅ Configure AWS region
3. ✅ Create ECR repository
4. ✅ Build and push Docker image
5. ✅ Deploy CloudFormation stack
6. ✅ Test the deployment

### Step 4: Verify Deployment

After deployment, you'll get output like:

```
🎉 Deployment completed successfully!

📋 Deployment Summary:
================================================
VPCId: vpc-12345678
ALBDNSName: production-psctech-alb-123456789.eu-north-1.elb.amazonaws.com
ApiGatewayUrl: https://abc123.execute-api.eu-north-1.amazonaws.com/production
ECSClusterName: production-psctech-cluster

🔗 API Endpoints:
================================================
API Gateway URL: https://abc123.execute-api.eu-north-1.amazonaws.com/production
Load Balancer DNS: production-psctech-alb-123456789.eu-north-1.elb.amazonaws.com
```

## 🔧 Configuration Options

### Environment Variables

The deployment supports different environments:

```powershell
# Production
.\deploy-aws-backend.ps1 -Environment production

# Staging
.\deploy-aws-backend.ps1 -Environment staging

# Development
.\deploy-aws-backend.ps1 -Environment development
```

### Custom Domain Setup

To use a custom domain (e.g., `api.psctech.com`):

1. **Purchase Domain** (if not already owned)
2. **Request SSL Certificate** in AWS Certificate Manager
3. **Update CloudFormation parameters**:
   ```yaml
   DomainName: api.psctech.com
   CertificateArn: arn:aws:acm:eu-north-1:123456789012:certificate/abc123
   ```

## 🔗 API Endpoints

### Base URLs
- **API Gateway**: `https://[api-id].execute-api.eu-north-1.amazonaws.com/production`
- **Load Balancer**: `http://[alb-dns-name]`
- **Custom Domain**: `https://api.psctech.com` (if configured)

### Available Endpoints
```
GET  /health              - Health check
GET  /health/detailed     - Detailed health status
POST /api/auth/login      - User authentication
POST /api/institution     - Institution registration
GET  /api/study/results   - Study results
POST /api/vouchers        - Voucher management
```

## 🧪 Testing

### Health Check
```bash
curl https://[api-url]/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "service": "PSCTECH Backend API",
  "version": "1.0.0",
  "environment": "Production"
}
```

### Authentication Test
```bash
curl -X POST https://[api-url]/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "principal@demoschool.com",
    "password": "password123"
  }'
```

## 📊 Monitoring

### CloudWatch Logs
- **Log Group**: `/ecs/production-psctech-backend`
- **Retention**: 30 days
- **Access**: AWS Console → CloudWatch → Log Groups

### Application Metrics
- **ECS Service**: CPU, Memory usage
- **ALB**: Request count, response time
- **API Gateway**: API calls, latency

## 🔒 Security

### Network Security
- **VPC**: Isolated network environment
- **Security Groups**: Restrict traffic to necessary ports
- **HTTPS**: All external traffic encrypted

### IAM Roles
- **ECS Execution Role**: Pull images, write logs
- **ECS Task Role**: Access RDS, Secrets Manager

## 🚨 Troubleshooting

### Common Issues

1. **Docker Build Fails**
   ```bash
   # Check Docker is running
   docker version
   
   # Clean Docker cache
   docker system prune -a
   ```

2. **ECR Login Fails**
   ```bash
   # Re-authenticate with ECR
   aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin [account-id].dkr.ecr.eu-north-1.amazonaws.com
   ```

3. **CloudFormation Fails**
   ```bash
   # Check stack events
   aws cloudformation describe-stack-events --stack-name psctech-backend-infrastructure
   
   # Delete failed stack
   aws cloudformation delete-stack --stack-name psctech-backend-infrastructure
   ```

4. **Health Check Fails**
   - Check ECS service logs in CloudWatch
   - Verify database connectivity
   - Check security group rules

### Logs and Debugging

```bash
# View ECS service logs
aws logs tail /ecs/production-psctech-backend --follow

# Check ECS service status
aws ecs describe-services --cluster production-psctech-cluster --services production-psctech-backend-service
```

## 🔄 Updates and Maintenance

### Update Application
```powershell
# Rebuild and redeploy
.\deploy-aws-backend.ps1 -Environment production
```

### Scale Application
```bash
# Scale ECS service
aws ecs update-service --cluster production-psctech-cluster --service production-psctech-backend-service --desired-count 4
```

### Update Infrastructure
```bash
# Update CloudFormation stack
aws cloudformation update-stack --stack-name psctech-backend-infrastructure --template-body file://aws-backend-infrastructure.yaml
```

## 💰 Cost Optimization

### Estimated Monthly Costs (eu-north-1)
- **ECS Fargate**: ~$30-50 (2 tasks, 512 CPU, 1GB RAM)
- **ALB**: ~$20
- **API Gateway**: ~$5-10 (depending on usage)
- **CloudWatch Logs**: ~$5-10
- **VPC/NAT Gateway**: ~$45
- **Total**: ~$105-135/month

### Cost Reduction Tips
- Use FARGATE_SPOT for non-production
- Reduce log retention period
- Use smaller instance sizes for development
- Enable auto-scaling based on demand

## 🎯 Next Steps

1. **Update Frontend**: Point to new API endpoint
2. **Test All Features**: Use demo credentials
3. **Set Up Monitoring**: Configure CloudWatch alarms
4. **Custom Domain**: Add SSL certificate and domain
5. **CI/CD Pipeline**: Automate deployments
6. **Backup Strategy**: Set up RDS backups

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review CloudWatch logs
3. Verify AWS permissions
4. Test locally with Docker

Your PSCTECH backend is now running on a scalable, production-ready AWS infrastructure! 🚀








