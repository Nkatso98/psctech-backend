# PSC Tech Multi-Tenant Azure SQL Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying PSC Tech as a true multi-tenant system where each institution gets its own completely isolated Azure SQL Database. This architecture ensures complete data separation, security, and scalability.

## 🏗️ Architecture Overview

### Multi-Tenant Database Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure SQL Server                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Master Database │  │ Institution 1   │  │ Institution │ │
│  │ (Tenant Mgmt)  │  │ Database        │  │ 2 Database  │ │
│  │                 │  │                 │  │             │ │
│  │ - Institutions │  │ - Users         │  │ - Users     │ │
│  │ - Tenant Mgmt  │  │ - Students      │  │ - Students  │ │
│  │ - Provisioning │  │ - Teachers      │  │ - Teachers  │ │
│  │ - Monitoring   │  │ - Classes       │  │ - Classes   │ │
│  │                 │  │ - Grades        │  │ - Grades    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Benefits

✅ **Complete Data Isolation**: No shared data between institutions  
✅ **Independent Scaling**: Each database scales independently  
✅ **Enhanced Security**: No cross-database access possible  
✅ **Custom Configurations**: Per-institution settings and features  
✅ **Independent Backups**: Separate backup schedules per institution  
✅ **Compliance Ready**: Meets strict data isolation requirements  

## 🚀 Prerequisites

### Azure Account Requirements
- **Azure Subscription**: Active subscription with billing enabled
- **Azure Role**: Contributor or Owner role for resource creation
- **Resource Group**: Existing or permission to create new resource group

### Tools Required
- **Azure Portal**: Web-based management interface
- **Azure CLI**: Command-line interface (recommended for automation)
- **PowerShell**: For Azure automation scripts
- **SQL Server Management Studio (SSMS)**: For database management
- **Azure Data Studio**: Modern database tool (recommended)

## 📋 Step-by-Step Deployment

### Step 1: Create Master Database

#### 1.1 Create Master Database

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "Your-Subscription-Name"

# Create resource group for master database
az group create --name "psc-tech-master-rg" --location "southafricanorth"

# Create SQL Server for master database
az sql server create \
  --name "psc-tech-master-server" \
  --resource-group "psc-tech-master-rg" \
  --location "southafricanorth" \
  --admin-user "psc_master_admin" \
  --admin-password "YourStrongPassword123!"

# Create Master Database
az sql db create \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "psc-tech-master" \
  --edition "Standard" \
  --capacity 20 \
  --family "Gen5"

# Configure firewall rules
az sql server firewall-rule create \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "AllowAzureServices" \
  --start-ip-address "0.0.0.0" \
  --end-ip-address "0.0.0.0"

az sql server firewall-rule create \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "AllowMyIP" \
  --start-ip-address "YOUR_IP_ADDRESS" \
  --end-ip-address "YOUR_IP_ADDRESS"
```

#### 1.2 Deploy Master Schema

1. **Connect to Master Database**
   ```
   Server: psc-tech-master-server.database.windows.net
   Database: psc-tech-master
   Authentication: SQL Server Authentication
   Login: psc_master_admin
   Password: [Your password]
   ```

2. **Execute Master Schema Script**
   - Open `multi-tenant-azure-sql-architecture.sql`
   - Execute the entire script
   - Verify all tables and stored procedures are created

3. **Verify Deployment**
   ```sql
   -- Check tables created
   SELECT TABLE_NAME, TABLE_TYPE 
   FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_TYPE = 'BASE TABLE'
   ORDER BY TABLE_NAME;

   -- Check stored procedures
   SELECT ROUTINE_NAME, ROUTINE_TYPE
   FROM INFORMATION_SCHEMA.ROUTINES
   WHERE ROUTINE_TYPE = 'PROCEDURE'
   ORDER BY ROUTINE_NAME;
   ```

### Step 2: Create Institution Database Template

#### 2.1 Create Template Database

```bash
# Create template database
az sql db create \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "psc-tech-template" \
  --edition "Standard" \
  --capacity 20 \
  --family "Gen5"
```

#### 2.2 Deploy Template Schema

1. **Connect to Template Database**
   ```
   Server: psc-tech-master-server.database.windows.net
   Database: psc-tech-template
   Authentication: SQL Server Authentication
   Login: psc_master_admin
   Password: [Your password]
   ```

2. **Execute Template Schema Script**
   - Open `institution-database-template.sql`
   - Execute the entire script
   - This creates the base schema for all institutions

3. **Create Template Backup**
   ```bash
   # Create backup of template database
   az sql db export \
     --resource-group "psc-tech-master-rg" \
     --server "psc-tech-master-server" \
     --name "psc-tech-template" \
     --storage-uri "https://yourstorageaccount.blob.core.windows.net/backups/template.bacpac" \
     --storage-key "YOUR_STORAGE_ACCOUNT_KEY" \
     --storage-key-type "StorageAccessKey"
   ```

### Step 3: Create First Institution Database

#### 3.1 Use Master Database to Provision Institution

1. **Connect to Master Database**
2. **Execute Provisioning Stored Procedure**

```sql
-- Create first institution database
EXEC sp_CreateInstitutionDatabase 
    @InstitutionCode = 'SCHOOL001',
    @InstitutionName = 'Sample Primary School',
    @InstitutionType = 'primary',
    @ServiceTier = 'Standard',
    @DTUsVCores = 20,
    @StorageGB = 20;
```

#### 3.2 Manual Database Creation (Alternative)

```bash
# Create institution database
az sql db create \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "psc_tech_school001_20241201_143022" \
  --edition "Standard" \
  --capacity 20 \
  --family "Gen5"

# Import template schema
az sql db import \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "psc_tech_school001_20241201_143022" \
  --storage-uri "https://yourstorageaccount.blob.core.windows.net/backups/template.bacpac" \
  --storage-key "YOUR_STORAGE_ACCOUNT_KEY" \
  --storage-key-type "StorageAccessKey"
```

#### 3.3 Configure Institution Database

1. **Connect to Institution Database**
2. **Update Institution Details**

```sql
-- Update institution details
UPDATE institution_details 
SET name = 'Sample Primary School',
    code = 'SCHOOL001',
    type = 'primary',
    district = 'Sample District',
    province = 'Sample Province'
WHERE id = (SELECT TOP 1 id FROM institution_details);

-- Create initial admin user
INSERT INTO users (username, email, password_hash, full_name, first_name, last_name, role)
VALUES ('admin', 'admin@school001.com', 'hashed_password_here', 'System Administrator', 'System', 'Administrator', 'superadmin');
```

### Step 4: Create Additional Institution Databases

#### 4.1 Automated Provisioning

```sql
-- Create multiple institutions
EXEC sp_CreateInstitutionDatabase 'SCHOOL002', 'City High School', 'secondary', 'Standard', 20, 20;
EXEC sp_CreateInstitutionDatabase 'SCHOOL003', 'Rural Primary School', 'primary', 'Basic', 10, 10;
EXEC sp_CreateInstitutionDatabase 'SCHOOL004', 'Technical College', 'combined', 'Premium', 50, 50;
```

#### 4.2 Bulk Provisioning Script

```sql
-- Bulk institution creation
DECLARE @Institutions TABLE (
    Code NVARCHAR(50),
    Name NVARCHAR(255),
    Type NVARCHAR(20),
    ServiceTier NVARCHAR(20),
    DTUs INT,
    StorageGB INT
);

INSERT INTO @Institutions VALUES
('SCHOOL005', 'Private Academy', 'primary', 'Standard', 20, 20),
('SCHOOL006', 'Public Secondary', 'secondary', 'Standard', 30, 30),
('SCHOOL007', 'International School', 'combined', 'Premium', 100, 100);

DECLARE @Code NVARCHAR(50), @Name NVARCHAR(255), @Type NVARCHAR(20), @Tier NVARCHAR(20), @DTUs INT, @Storage INT;

DECLARE institution_cursor CURSOR FOR
SELECT Code, Name, Type, ServiceTier, DTUs, StorageGB FROM @Institutions;

OPEN institution_cursor;
FETCH NEXT FROM institution_cursor INTO @Code, @Name, @Type, @Tier, @DTUs, @Storage;

WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC sp_CreateInstitutionDatabase @Code, @Name, @Type, @Tier, @DTUs, @Storage;
    FETCH NEXT FROM institution_cursor INTO @Code, @Name, @Type, @Tier, @DTUs, @Storage;
END

CLOSE institution_cursor;
DEALLOCATE institution_cursor;
```

## 🔧 Configuration Options

### Service Tier Selection by Institution Size

| Institution Size | Students | Teachers | Service Tier | DTUs/vCores | Storage | Monthly Cost |
|------------------|----------|----------|--------------|-------------|---------|--------------|
| **Small** | 1-200 | 5-20 | Basic | 5 | 2 GB | $5-10 |
| **Medium** | 200-800 | 20-50 | Standard S1 | 20 | 20 GB | $30-50 |
| **Large** | 800-2000 | 50-100 | Standard S2 | 50 | 50 GB | $75-100 |
| **Enterprise** | 2000+ | 100+ | Premium P1 | 125 | 100 GB | $200-300 |

### Database Naming Convention

```
psc_tech_[INSTITUTION_CODE]_[YYYYMMDD]_[HHMMSS]

Examples:
- psc_tech_school001_20241201_143022
- psc_tech_academy002_20241201_143045
- psc_tech_college003_20241201_143108
```

## 🔐 Security Configuration

### Network Security

```bash
# Create VNet for private access (optional)
az network vnet create \
  --resource-group "psc-tech-master-rg" \
  --name "psc-tech-vnet" \
  --subnet-name "default"

# Configure private endpoint for master database
az network private-endpoint create \
  --resource-group "psc-tech-master-rg" \
  --name "master-private-endpoint" \
  --vnet-name "psc-tech-vnet" \
  --subnet "default" \
  --private-connection-resource-id "/subscriptions/YOUR_SUBSCRIPTION/resourceGroups/psc-tech-master-rg/providers/Microsoft.Sql/servers/psc-tech-master-server" \
  --group-ids "sqlServer" \
  --connection-name "master-connection"
```

### Authentication & Authorization

```sql
-- Create application user for each institution database
-- This should be done in each institution database

-- Example for SCHOOL001
USE [psc_tech_school001_20241201_143022];

CREATE USER [school001_app_user] WITHOUT LOGIN;
CREATE ROLE [school001_app_role];

GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO [school001_app_role];
GRANT EXECUTE ON SCHEMA::dbo TO [school001_app_role];

ALTER ROLE [school001_app_role] ADD MEMBER [school001_app_user];
```

## 📊 Monitoring & Management

### Master Database Monitoring

```sql
-- Check all tenant databases
SELECT * FROM vw_tenant_overview;

-- Check tenant performance
SELECT * FROM vw_tenant_performance;

-- Check provisioning logs
SELECT 
    i.code,
    i.name,
    pl.action,
    pl.status,
    pl.started_at,
    pl.completed_at,
    pl.duration_seconds,
    pl.error_message
FROM tenant_provisioning_log pl
JOIN institutions i ON pl.institution_id = i.id
ORDER BY pl.started_at DESC;
```

### Azure Monitor Integration

```bash
# Enable diagnostic settings for master database
az monitor diagnostic-settings create \
  --resource "/subscriptions/YOUR_SUBSCRIPTION/resourceGroups/psc-tech-master-rg/providers/Microsoft.Sql/servers/psc-tech-master-server/databases/psc-tech-master" \
  --name "master-diagnostics" \
  --storage-account "yourstorageaccount" \
  --logs '[{"category": "SQLInsights", "enabled": true}, {"category": "AutomaticTuning", "enabled": true}, {"category": "QueryStoreRuntimeStatistics", "enabled": true}]' \
  --metrics '[{"category": "Basic", "enabled": true}]'
```

## 🔄 Backup & Recovery

### Master Database Backup

```bash
# Create backup of master database
az sql db export \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "psc-tech-master" \
  --storage-uri "https://yourstorageaccount.blob.core.windows.net/backups/master.bacpac" \
  --storage-key "YOUR_STORAGE_ACCOUNT_KEY" \
  --storage-key-type "StorageAccessKey"
```

### Institution Database Backups

```bash
# Backup all institution databases
az sql db list \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --query "[?name != 'psc-tech-master' && name != 'psc-tech-template'].name" \
  --output tsv | while read dbname; do
    echo "Backing up $dbname..."
    az sql db export \
      --resource-group "psc-tech-master-rg" \
      --server "psc-tech-master-server" \
      --name "$dbname" \
      --storage-uri "https://yourstorageaccount.blob.core.windows.net/backups/$dbname.bacpac" \
      --storage-key "YOUR_STORAGE_ACCOUNT_KEY" \
      --storage-key-type "StorageAccessKey"
done
```

## 📈 Scaling & Optimization

### Vertical Scaling

```bash
# Scale up institution database
az sql db update \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "psc_tech_school001_20241201_143022" \
  --capacity 50
```

### Horizontal Scaling

```bash
# Create read replica for high-traffic institution
az sql db replica create \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --name "psc_tech_school001_20241201_143022" \
  --partner-server "psc-tech-replica-server" \
  --partner-resource-group "psc-tech-replica-rg"
```

## 🚨 Troubleshooting

### Common Issues

#### Database Creation Fails
```bash
# Check Azure SQL quotas
az sql db list \
  --resource-group "psc-tech-master-rg" \
  --server "psc-tech-master-server" \
  --query "[].{Name:name, Status:status, Size:maxSizeBytes}" \
  --output table
```

#### Connection Issues
```sql
-- Check database status in master
SELECT 
    i.code,
    i.name,
    td.database_name,
    td.status,
    td.last_backup
FROM institutions i
JOIN tenant_databases td ON i.id = td.institution_id
WHERE i.code = 'SCHOOL001';
```

#### Performance Issues
```sql
-- Check database performance metrics
SELECT 
    database_name,
    avg_cpu_percent,
    avg_data_io_percent,
    avg_log_write_percent
FROM sys.dm_db_resource_stats
ORDER BY start_time DESC;
```

## 🔮 Future Enhancements

### Advanced Features

1. **Elastic Pools**
   - Group similar-sized institutions
   - Cost optimization
   - Shared resource management

2. **Geo-Replication**
   - Cross-region institution databases
   - Disaster recovery
   - Geographic compliance

3. **Automated Provisioning**
   - Self-service portal for institutions
   - Automated scaling based on usage
   - Cost optimization algorithms

### Integration Options

1. **Azure Functions**
   - Automated database provisioning
   - Monitoring and alerting
   - Backup automation

2. **Logic Apps**
   - Workflow automation
   - Approval processes
   - Integration with external systems

3. **Power BI**
   - Cross-tenant analytics (aggregated)
   - Performance dashboards
   - Cost analysis reports

## 📞 Support & Resources

### Microsoft Support

- **Azure Support Plans**: Basic, Developer, Standard, Professional Direct
- **Documentation**: [docs.microsoft.com/azure/azure-sql](https://docs.microsoft.com/azure/azure-sql)
- **Community**: [Stack Overflow](https://stackoverflow.com/questions/tagged/azure-sql-database)

### PSC Tech Specific

- **Master Schema**: `multi-tenant-azure-sql-architecture.sql`
- **Institution Template**: `institution-database-template.sql`
- **Multi-Tenant Guide**: `MULTI_TENANT_DEPLOYMENT_GUIDE.md`
- **Performance Monitoring**: Query Store and Azure Monitor

---

This multi-tenant deployment guide ensures that your PSC Tech system provides complete data isolation between institutions while maintaining centralized management and monitoring capabilities.


