# PSCTECH Complete AWS Deployment Guide

## 🚀 Overview

This comprehensive guide provides two deployment options for your PSCTECH backend on AWS:

1. **AWS ECS Fargate** - Container-based deployment (recommended for scalability)
2. **AWS Elastic Beanstalk** - Platform-as-a-Service deployment (easier management)

Both options include:
- ✅ **Route 53 DNS Management** - Custom domain setup
- ✅ **AWS Certificate Manager** - SSL certificates
- ✅ **Multi-tenant Database** - RDS SQL Server
- ✅ **Auto-scaling** - Based on demand
- ✅ **Monitoring** - CloudWatch integration

## 📋 Prerequisites

### Required Tools
- **AWS CLI** - [Install here](https://aws.amazon.com/cli/)
- **Docker Desktop** - [Install here](https://www.docker.com/products/docker-desktop/) (for ECS option)
- **EB CLI** - [Install here](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html) (for Elastic Beanstalk option)
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
   - ECS/Elastic Beanstalk (Full Access)
   - ECR (Full Access)
   - IAM (Limited - for creating roles)
   - VPC (Full Access)
   - Route 53 (Full Access)
   - Certificate Manager (Full Access)
   - S3 (Full Access)

## 🏗️ Architecture Comparison

### Option 1: AWS ECS Fargate
```
Internet → API Gateway → Application Load Balancer → ECS Fargate → .NET Backend
                                    ↓
                              RDS SQL Server
```

**Pros:**
- ✅ Serverless containers (no server management)
- ✅ Better resource utilization
- ✅ More granular control
- ✅ Cost-effective for variable workloads

**Cons:**
- ❌ More complex setup
- ❌ Requires Docker knowledge

### Option 2: AWS Elastic Beanstalk
```
Internet → Route 53 → Application Load Balancer → EC2 Instances → .NET Backend
                                    ↓
                              RDS SQL Server
```

**Pros:**
- ✅ Easier deployment and management
- ✅ Automatic platform updates
- ✅ Built-in monitoring
- ✅ Familiar for traditional deployments

**Cons:**
- ❌ Less control over infrastructure
- ❌ Higher costs for consistent workloads
- ❌ Vendor lock-in

## 📁 Files Overview

### ECS Deployment Files
- `aws-backend-infrastructure.yaml` - CloudFormation template for ECS
- `Dockerfile` - Container configuration
- `deploy-aws-backend.ps1` - ECS deployment script

### Elastic Beanstalk Deployment Files
- `aws-elastic-beanstalk-configuration.yaml` - CloudFormation template for EB
- `.ebextensions/01_nginx_ssl.config` - SSL configuration
- `.ebextensions/02_application.config` - Application configuration
- `deploy-elastic-beanstalk.ps1` - EB deployment script

### Common Files
- `backend/appsettings.json` - Updated for AWS
- `backend/Controllers/HealthController.cs` - Health check endpoint

## 🚀 Deployment Options

### Option 1: ECS Fargate Deployment

#### Step 1: Prepare Environment
```powershell
# Ensure all files are in place
ls aws-backend-infrastructure.yaml
ls Dockerfile
ls deploy-aws-backend.ps1
```

#### Step 2: Deploy Infrastructure
```powershell
# Deploy to production
.\deploy-aws-backend.ps1 -Environment production

# Deploy to development
.\deploy-aws-backend.ps1 -Environment development
```

#### Step 3: Verify Deployment
The script will output:
- ✅ ECS Cluster URL
- ✅ API Gateway URL
- ✅ Load Balancer DNS
- ✅ Health check results

### Option 2: Elastic Beanstalk Deployment

#### Step 1: Prepare Environment
```powershell
# Ensure all files are in place
ls aws-elastic-beanstalk-configuration.yaml
ls .ebextensions/
ls deploy-elastic-beanstalk.ps1
```

#### Step 2: Deploy Infrastructure
```powershell
# Deploy with custom domain
.\deploy-elastic-beanstalk.ps1 -Environment production -DomainName "yourdomain.com" -ApiSubdomain "api"

# Deploy with default domain
.\deploy-elastic-beanstalk.ps1 -Environment production
```

#### Step 3: Verify Deployment
The script will output:
- ✅ Elastic Beanstalk Environment URL
- ✅ Custom API Domain
- ✅ SSL Certificate Status
- ✅ Health check results

## 🔧 Configuration Options

### Environment Variables

Both deployment options support environment-specific configurations:

```powershell
# Production
-Environment production

# Staging
-Environment staging

# Development
-Environment development
```

### Domain Configuration

For Elastic Beanstalk, you can specify custom domains:

```powershell
-DomainName "psctech.com"
-ApiSubdomain "api"
```

This will create:
- `https://api.psctech.com` - API endpoint
- `https://www.psctech.com` - Website (optional)
- `https://psctech.com` - Root domain

### SSL Certificate Management

Both options automatically:
- ✅ Request SSL certificates from AWS Certificate Manager
- ✅ Validate certificates using DNS validation
- ✅ Configure HTTPS endpoints
- ✅ Set up security headers

## 🔗 API Endpoints

### Base URLs
- **ECS**: `https://[api-id].execute-api.eu-north-1.amazonaws.com/production`
- **Elastic Beanstalk**: `https://api.yourdomain.com`
- **Health Check**: `[base-url]/health`

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
- **ECS**: `/ecs/production-psctech-backend`
- **Elastic Beanstalk**: `/aws/elasticbeanstalk/production-psctech-backend-env`
- **Retention**: 30 days

### Application Metrics
- **CPU/Memory Usage**
- **Request Count**
- **Response Time**
- **Error Rate**

### Setting Up Alarms
```bash
# Create CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "psctech-cpu-high" \
  --alarm-description "CPU usage is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## 🔒 Security

### Network Security
- **VPC**: Isolated network environment
- **Security Groups**: Restrict traffic to necessary ports
- **HTTPS**: All external traffic encrypted
- **WAF**: Web Application Firewall (optional)

### IAM Roles
- **ECS Execution Role**: Pull images, write logs
- **ECS Task Role**: Access RDS, Secrets Manager
- **Elastic Beanstalk Role**: Manage EC2 instances

### SSL/TLS Configuration
- **Protocols**: TLS 1.2, TLS 1.3
- **Ciphers**: ECDHE-RSA-AES128-GCM-SHA256, ECDHE-RSA-AES256-GCM-SHA384
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options

## 💰 Cost Comparison

### ECS Fargate (Monthly)
- **Compute**: ~$30-50 (2 tasks, 512 CPU, 1GB RAM)
- **ALB**: ~$20
- **API Gateway**: ~$5-10
- **CloudWatch**: ~$5-10
- **VPC**: ~$45
- **Total**: ~$105-135

### Elastic Beanstalk (Monthly)
- **EC2 Instances**: ~$40-80 (t3.small, 1-2 instances)
- **ALB**: ~$20
- **CloudWatch**: ~$5-10
- **VPC**: ~$45
- **Total**: ~$110-155

### Cost Optimization Tips
- Use FARGATE_SPOT for non-production ECS
- Use t3 instances for Elastic Beanstalk
- Enable auto-scaling based on demand
- Reduce log retention period

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Validation Fails**
   ```bash
   # Check certificate status
   aws acm describe-certificate --certificate-arn [cert-arn]
   
   # Verify DNS records
   nslookup [domain]
   ```

2. **Health Check Fails**
   ```bash
   # Check application logs
   aws logs tail [log-group] --follow
   
   # Check environment status
   aws elasticbeanstalk describe-environments --environment-names [env-name]
   ```

3. **Database Connection Issues**
   ```bash
   # Verify security group rules
   aws ec2 describe-security-groups --group-ids [sg-id]
   
   # Test database connectivity
   telnet [rds-endpoint] 1433
   ```

### Logs and Debugging

```bash
# ECS logs
aws logs tail /ecs/production-psctech-backend --follow

# Elastic Beanstalk logs
aws logs tail /aws/elasticbeanstalk/production-psctech-backend-env --follow

# Check environment status
aws elasticbeanstalk describe-environments --environment-names production-psctech-backend-env
```

## 🔄 Updates and Maintenance

### Update Application
```powershell
# ECS
.\deploy-aws-backend.ps1 -Environment production

# Elastic Beanstalk
.\deploy-elastic-beanstalk.ps1 -Environment production
```

### Scale Application
```bash
# ECS
aws ecs update-service --cluster production-psctech-cluster --service production-psctech-backend-service --desired-count 4

# Elastic Beanstalk
aws elasticbeanstalk update-environment --environment-name production-psctech-backend-env --option-settings Namespace=aws:autoscaling:asg,OptionName=MaxSize,Value=4
```

### Update Infrastructure
```bash
# Update CloudFormation stack
aws cloudformation update-stack --stack-name [stack-name] --template-body file://[template-file]
```

## 🎯 Recommendation

### Choose ECS Fargate if:
- ✅ You want serverless containers
- ✅ You have variable workloads
- ✅ You need granular control
- ✅ You're comfortable with Docker

### Choose Elastic Beanstalk if:
- ✅ You want easier management
- ✅ You prefer traditional deployments
- ✅ You need automatic platform updates
- ✅ You want faster initial setup

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review CloudWatch logs
3. Verify AWS permissions
4. Test locally first

## 🎉 Next Steps

1. **Choose your deployment option** (ECS or Elastic Beanstalk)
2. **Run the database setup scripts** (if not done already)
3. **Deploy using the appropriate script**
4. **Update your frontend** to use the new API endpoint
5. **Test all PSCTECH features** with demo credentials
6. **Set up monitoring and alerts**
7. **Configure custom domain** (if using Elastic Beanstalk)

Your PSCTECH backend will be running on a production-ready AWS infrastructure with full DNS management and SSL certificates! 🚀








