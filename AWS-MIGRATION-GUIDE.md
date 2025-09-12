# AWS Migration Guide for PSCTECH Platform

## Overview

This guide provides a complete migration path from Azure to AWS for the PSCTECH multi-tenant school management platform. The migration includes:

- **Multi-tenant database architecture** with complete data isolation
- **AWS RDS PostgreSQL** for scalable database management
- **AWS Elastic Beanstalk** for application hosting
- **Complete feature coverage** for all frontend and backend functionality

## 🏗️ Architecture Overview

### Multi-Tenant Database Design

```
┌─────────────────────────────────────────────────────────────┐
│                    MASTER DATABASE                          │
│  (psctech_master) - Tenant Management & Routing            │
├─────────────────────────────────────────────────────────────┤
│ • tenant_registry - Tenant information                     │
│ • tenant_connections - Database connections                │
│ • subscription_plans - Available plans                     │
│ • system_audit_log - System-wide audit trail              │
│ • super_admin_users - Platform administrators              │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  TENANT DATABASES                           │
│  (psctech_tenant_001, psctech_tenant_002, etc.)            │
├─────────────────────────────────────────────────────────────┤
│ • Complete isolation per institution                       │
│ • All business logic tables                                │
│ • User management, students, teachers                      │
│ • Vouchers, assessments, attendance                        │
│ • Study sessions, communications                           │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Pre-Migration Checklist

### Required AWS Services
- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI configured
- [ ] AWS RDS PostgreSQL instance
- [ ] AWS Elastic Beanstalk environment
- [ ] AWS Route 53 (for DNS)
- [ ] AWS Certificate Manager (for SSL)
- [ ] AWS S3 (for file storage)

### Data Preparation
- [ ] Export existing Azure SQL data
- [ ] Backup current application
- [ ] Document current configuration
- [ ] Plan downtime window

## 🚀 Step-by-Step Migration Process

### Step 1: AWS Infrastructure Setup

#### 1.1 Create Master Database
```bash
# Create master database on AWS RDS PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier psctech-master \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username psctechadmin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name psctech-subnet-group
```

#### 1.2 Run Master Database Schema
```bash
# Connect to master database and run schema
psql -h psctech-master.xxxxx.region.rds.amazonaws.com -U psctechadmin -d postgres -f aws-master-database-schema.sql
```

#### 1.3 Create Tenant Database Template
```bash
# Create template database for new tenants
aws rds create-db-instance \
  --db-instance-identifier psctech-tenant-template \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username psctechadmin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --storage-type gp2
```

### Step 2: Application Code Updates

#### 2.1 Update Connection Strings
Update `backend/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "MasterConnection": "Host=psctech-master.xxxxx.region.rds.amazonaws.com;Database=psctech_master;Username=psctechadmin;Password=YourSecurePassword123!;",
    "DefaultConnection": "Host=psctech-tenant.xxxxx.region.rds.amazonaws.com;Database=psctech_tenant_001;Username=psctechadmin;Password=YourSecurePassword123!;"
  },
  "AWS": {
    "Region": "us-east-1",
    "RDS": {
      "MasterEndpoint": "psctech-master.xxxxx.region.rds.amazonaws.com",
      "TenantTemplateEndpoint": "psctech-tenant-template.xxxxx.region.rds.amazonaws.com"
    },
    "S3": {
      "BucketName": "psctech-files",
      "Region": "us-east-1"
    }
  }
}
```

#### 2.2 Update Database Context
Create new AWS-specific database context:

```csharp
// backend/Data/AwsPscTechDbContext.cs
public class AwsPscTechDbContext : DbContext
{
    private readonly string _connectionString;
    
    public AwsPscTechDbContext(string connectionString)
    {
        _connectionString = connectionString;
    }
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_connectionString);
    }
    
    // All your existing DbSet properties...
}
```

#### 2.3 Create Tenant Management Service
```csharp
// backend/Services/TenantManagementService.cs
public class TenantManagementService
{
    private readonly string _masterConnectionString;
    
    public async Task<string> GetTenantConnectionString(string tenantCode)
    {
        using var context = new AwsPscTechDbContext(_masterConnectionString);
        var tenant = await context.TenantRegistry
            .FirstOrDefaultAsync(t => t.TenantCode == tenantCode);
        
        return tenant?.ConnectionString;
    }
    
    public async Task<Guid> CreateNewTenant(string tenantCode, string tenantName)
    {
        // Create new tenant database
        var databaseName = $"psctech_tenant_{tenantCode.ToLower()}";
        var connectionString = GenerateConnectionString(databaseName);
        
        // Insert into master database
        using var context = new AwsPscTechDbContext(_masterConnectionString);
        var tenantId = await context.CreateTenant(
            tenantCode, tenantName, databaseName, 
            "psctech-tenant.xxxxx.region.rds.amazonaws.com", 
            connectionString
        );
        
        // Create tenant database schema
        await CreateTenantDatabase(databaseName);
        
        return tenantId;
    }
}
```

### Step 3: Database Migration

#### 3.1 Export Azure Data
```bash
# Export data from Azure SQL
sqlcmd -S psctech-rg.database.windows.net -U psctechadmin -P Rluthando@12 -d psctech_main -Q "SELECT * FROM institutions" -o institutions.csv
```

#### 3.2 Import to AWS
```bash
# Import to AWS RDS
psql -h psctech-master.xxxxx.region.rds.amazonaws.com -U psctechadmin -d psctech_master -c "\copy tenant_registry FROM 'institutions.csv' CSV HEADER"
```

### Step 4: AWS Elastic Beanstalk Deployment

#### 4.1 Create Application
```bash
# Create Elastic Beanstalk application
aws elasticbeanstalk create-application --application-name psctech-backend
```

#### 4.2 Create Environment
```bash
# Create environment configuration
cat > psctech-environment.json << EOF
{
  "ApplicationName": "psctech-backend",
  "EnvironmentName": "psctech-production",
  "SolutionStackName": "64bit Amazon Linux 2 v2.4.3 running .NET Core",
  "OptionSettings": [
    {
      "Namespace": "aws:autoscaling:launchconfiguration",
      "OptionName": "InstanceType",
      "Value": "t3.small"
    },
    {
      "Namespace": "aws:autoscaling:asg",
      "OptionName": "MinSize",
      "Value": "1"
    },
    {
      "Namespace": "aws:autoscaling:asg",
      "OptionName": "MaxSize",
      "Value": "4"
    },
    {
      "Namespace": "aws:elasticbeanstalk:environment",
      "OptionName": "EnvironmentType",
      "Value": "LoadBalanced"
    }
  ]
}
EOF

# Create environment
aws elasticbeanstalk create-environment --cli-input-json file://psctech-environment.json
```

#### 4.3 Deploy Application
```bash
# Build and package application
dotnet publish -c Release -o ./publish
cd publish
zip -r ../psctech-backend.zip .

# Deploy to Elastic Beanstalk
aws elasticbeanstalk create-application-version \
  --application-name psctech-backend \
  --version-label v1.0.0 \
  --source-bundle S3Bucket="psctech-deployments",S3Key="psctech-backend.zip"

aws elasticbeanstalk update-environment \
  --environment-name psctech-production \
  --version-label v1.0.0
```

### Step 5: Frontend Configuration Update

#### 5.1 Update API Endpoints
Update frontend configuration to point to new AWS backend:

```typescript
// src/lib/api-config.ts
export const API_CONFIG = {
  baseUrl: 'https://psctech-production.elasticbeanstalk.com',
  endpoints: {
    auth: '/api/auth',
    study: '/api/study',
    vouchers: '/api/voucher',
    institutions: '/api/institution'
  }
};
```

#### 5.2 Update CORS Settings
Update backend CORS configuration:

```csharp
// backend/Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://psctech-2f998.web.app",
            "https://psctech-2f998.firebaseapp.com",
            "http://localhost:3000"
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});
```

### Step 6: Testing and Validation

#### 6.1 Database Connectivity Test
```bash
# Test master database connection
psql -h psctech-master.xxxxx.region.rds.amazonaws.com -U psctechadmin -d psctech_master -c "SELECT COUNT(*) FROM tenant_registry;"

# Test tenant database connection
psql -h psctech-tenant.xxxxx.region.rds.amazonaws.com -U psctechadmin -d psctech_tenant_001 -c "SELECT COUNT(*) FROM users;"
```

#### 6.2 API Endpoint Testing
```bash
# Test authentication
curl -X POST https://psctech-production.elasticbeanstalk.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"principal","password":"password123"}'

# Test voucher creation
curl -X POST https://psctech-production.elasticbeanstalk.com/api/voucher/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"denomination":25,"parentGuardianName":"John Doe","learnerCount":2,"institutionId":"DEMO001","issuedByUserId":"USER_ID"}'
```

#### 6.3 Frontend Integration Test
1. Deploy updated frontend to Firebase
2. Test all user roles (Principal, Teacher, Parent, Learner)
3. Verify all dashboard functionality
4. Test voucher system end-to-end
5. Verify study session features

## 📊 Complete Feature Coverage

### ✅ Core Features Implemented

#### User Management
- [x] Multi-role authentication (Principal, Teacher, Parent, Learner, SGB)
- [x] User profiles with extended information
- [x] Password reset functionality
- [x] Role-based access control

#### Institution Management
- [x] Institution registration and setup
- [x] Multi-tenant database isolation
- [x] Subscription plan management
- [x] Institution settings and configuration

#### Student Management
- [x] Student registration and profiles
- [x] Grade and class management
- [x] Parent-student relationships
- [x] Academic records tracking

#### Teacher Management
- [x] Teacher profiles and qualifications
- [x] Subject assignments
- [x] Class allocations
- [x] Performance tracking

#### Attendance System
- [x] Daily attendance tracking
- [x] Multiple attendance statuses
- [x] Attendance reports and analytics
- [x] Automated attendance summaries

#### Assessment System
- [x] Multiple assessment types (Tests, Exams, Assignments)
- [x] Grade tracking and calculations
- [x] Performance analytics
- [x] Report generation

#### Study Zone & AI Features
- [x] AI-powered study sessions
- [x] Question generation
- [x] Performance tracking
- [x] Personalized recommendations
- [x] Weak area identification

#### Voucher System
- [x] Voucher generation and management
- [x] Secure voucher redemption
- [x] Multi-learner support (1-10 learners)
- [x] Audit trail and tracking
- [x] Expiry management

#### Communication System
- [x] Internal messaging system
- [x] Announcements and notifications
- [x] Role-based communication
- [x] Message tracking and history

#### Reporting & Analytics
- [x] Academic performance reports
- [x] Attendance analytics
- [x] Voucher usage reports
- [x] Custom report templates
- [x] PDF export functionality

### 🎯 Dashboard Features by Role

#### Principal Dashboard
- [x] Institution overview and statistics
- [x] Student and teacher management
- [x] Academic performance monitoring
- [x] Voucher system management
- [x] Financial reports and analytics
- [x] Staff performance tracking

#### Teacher Dashboard
- [x] Class management and assignments
- [x] Student performance tracking
- [x] Assessment creation and grading
- [x] Attendance management
- [x] Communication tools
- [x] AI homework and test generation

#### Parent Dashboard
- [x] Child academic performance
- [x] Attendance monitoring
- [x] Communication with teachers
- [x] Voucher redemption
- [x] Progress tracking
- [x] School announcements

#### Learner Dashboard
- [x] Personal academic records
- [x] Study session access
- [x] Assignment tracking
- [x] Performance analytics
- [x] Communication features
- [x] AI study assistance

## 🔧 Configuration Files

### AWS Infrastructure as Code
Create `aws-infrastructure.yaml` for CloudFormation:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'PSCTECH Multi-Tenant Platform Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]

Resources:
  # RDS Master Database
  MasterDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: psctech-master
      Engine: postgres
      DBInstanceClass: db.t3.micro
      AllocatedStorage: 20
      MasterUsername: psctechadmin
      MasterUserPassword: !Ref MasterDBPassword
      VPCSecurityGroups: [!Ref DatabaseSecurityGroup]

  # Elastic Beanstalk Application
  PscTechApplication:
    Type: AWS::ElasticBeanstalk::Application
    Properties:
      ApplicationName: psctech-backend
      Description: PSCTECH Multi-Tenant Backend

  # Elastic Beanstalk Environment
  PscTechEnvironment:
    Type: AWS::ElasticBeanstalk::Environment
    Properties:
      ApplicationName: !Ref PscTechApplication
      EnvironmentName: psctech-production
      SolutionStackName: 64bit Amazon Linux 2 v2.4.3 running .NET Core
      OptionSettings:
        - Namespace: aws:autoscaling:launchconfiguration
          OptionName: InstanceType
          Value: t3.small
        - Namespace: aws:autoscaling:asg
          OptionName: MinSize
          Value: 1
        - Namespace: aws:autoscaling:asg
          OptionName: MaxSize
          Value: 4
```

### Environment Variables
Create `.env.production`:

```bash
# Database Configuration
MASTER_DB_HOST=psctech-master.xxxxx.region.rds.amazonaws.com
MASTER_DB_NAME=psctech_master
MASTER_DB_USER=psctechadmin
MASTER_DB_PASSWORD=YourSecurePassword123!

# AWS Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=psctech-files
AWS_RDS_TENANT_TEMPLATE=psctech-tenant-template.xxxxx.region.rds.amazonaws.com

# Application Configuration
JWT_SECRET=psctech-jwt-secret-key-2024-aws-production
JWT_ISSUER=PscTechBackend
JWT_AUDIENCE=PscTechFrontend
JWT_EXPIRES_IN=24h

# CORS Origins
CORS_ORIGINS=https://psctech-2f998.web.app,https://psctech-2f998.firebaseapp.com
```

## 🚀 Deployment Scripts

### Automated Deployment Script
Create `deploy-to-aws.ps1`:

```powershell
# Deploy PSCTECH to AWS
param(
    [string]$Environment = "production",
    [string]$Version = "1.0.0"
)

Write-Host "🚀 Starting PSCTECH AWS Deployment..." -ForegroundColor Green

# Build application
Write-Host "📦 Building application..." -ForegroundColor Yellow
dotnet publish -c Release -o ./publish

# Package application
Write-Host "📦 Packaging application..." -ForegroundColor Yellow
cd publish
Compress-Archive -Path * -DestinationPath ../psctech-backend.zip
cd ..

# Upload to S3
Write-Host "☁️ Uploading to S3..." -ForegroundColor Yellow
aws s3 cp psctech-backend.zip s3://psctech-deployments/

# Create application version
Write-Host "📋 Creating application version..." -ForegroundColor Yellow
aws elasticbeanstalk create-application-version `
  --application-name psctech-backend `
  --version-label "v$Version" `
  --source-bundle S3Bucket="psctech-deployments",S3Key="psctech-backend.zip"

# Deploy to environment
Write-Host "🚀 Deploying to environment..." -ForegroundColor Yellow
aws elasticbeanstalk update-environment `
  --environment-name "psctech-$Environment" `
  --version-label "v$Version"

Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host "🌐 Application URL: https://psctech-$Environment.elasticbeanstalk.com" -ForegroundColor Cyan
```

## 🔍 Testing Checklist

### Database Testing
- [ ] Master database connectivity
- [ ] Tenant database creation
- [ ] Data isolation between tenants
- [ ] User authentication across tenants
- [ ] Voucher system functionality

### API Testing
- [ ] Authentication endpoints
- [ ] User management endpoints
- [ ] Voucher creation and redemption
- [ ] Study session endpoints
- [ ] Assessment management
- [ ] Attendance tracking

### Frontend Testing
- [ ] All dashboard roles
- [ ] Voucher system UI
- [ ] Study zone functionality
- [ ] Communication features
- [ ] Report generation
- [ ] File upload/download

### Performance Testing
- [ ] Database query performance
- [ ] API response times
- [ ] Concurrent user handling
- [ ] Multi-tenant isolation
- [ ] Scalability testing

## 📈 Monitoring and Maintenance

### AWS CloudWatch Setup
```bash
# Enable CloudWatch monitoring
aws cloudwatch put-metric-alarm \
  --alarm-name "PSCTECH-HighCPU" \
  --alarm-description "High CPU utilization" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Database Monitoring
```sql
-- Monitor tenant usage
SELECT 
    tenant_code,
    COUNT(*) as active_users,
    SUM(total_requests) as total_requests,
    AVG(storage_used_gb) as avg_storage
FROM tenant_usage 
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tenant_code;
```

## 🎉 Migration Complete!

After completing all steps, your PSCTECH platform will be fully migrated to AWS with:

✅ **Complete multi-tenant architecture**
✅ **All features preserved and enhanced**
✅ **Scalable AWS infrastructure**
✅ **Comprehensive testing coverage**
✅ **Production-ready deployment**

### Next Steps
1. Monitor application performance
2. Set up automated backups
3. Configure alerting and monitoring
4. Plan for future scaling
5. Document operational procedures

---

**Need Help?** Contact the development team for support during migration.








