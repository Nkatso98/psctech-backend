# PSC Tech - Azure SQL Database Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the PSC Tech database schema on Azure SQL Database, including setup, configuration, and best practices for production deployment.

## 🚀 Prerequisites

### Azure Account Requirements
- **Azure Subscription**: Active subscription with billing enabled
- **Azure Role**: Contributor or Owner role for resource creation
- **Resource Group**: Existing or permission to create new resource group

### Tools Required
- **Azure Portal**: Web-based management interface
- **Azure CLI**: Command-line interface (optional but recommended)
- **SQL Server Management Studio (SSMS)**: For database management
- **Azure Data Studio**: Modern database tool (recommended)

## 📋 Step-by-Step Deployment

### Step 1: Create Azure SQL Database

#### Option A: Azure Portal (Recommended for beginners)

1. **Navigate to Azure Portal**
   - Go to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create SQL Database**
   - Click "Create a resource"
   - Search for "SQL Database"
   - Click "Create"

3. **Configure Basic Settings**
   ```
   Resource Group: Create new or select existing
   Database Name: psc-tech-db
   Server: Create new
     - Server Name: psc-tech-server-[unique]
     - Location: South Africa North (or nearest region)
     - Authentication Method: Use SQL authentication
     - Server Admin Login: psc_admin
     - Password: [Strong password]
   ```

4. **Configure Compute + Storage**
   ```
   Service Tier: Standard (S1) - Start with 20 DTUs
   Storage: 20 GB (minimum)
   Backup Storage Redundancy: Geo-redundant
   ```

5. **Configure Networking**
   ```
   Connectivity Method: Public endpoint
   Firewall Rules: Allow Azure services and resources
   Add your IP address for development access
   ```

6. **Configure Security**
   ```
   Enable Microsoft Defender for SQL: Yes (recommended)
   Enable Azure AD authentication: Optional
   ```

7. **Review and Create**
   - Review all settings
   - Click "Create"
   - Wait for deployment (5-10 minutes)

#### Option B: Azure CLI

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "Your-Subscription-Name"

# Create resource group
az group create --name "psc-tech-rg" --location "southafricanorth"

# Create SQL Server
az sql server create \
  --name "psc-tech-server" \
  --resource-group "psc-tech-rg" \
  --location "southafricanorth" \
  --admin-user "psc_admin" \
  --admin-password "YourStrongPassword123!"

# Create SQL Database
az sql db create \
  --resource-group "psc-tech-rg" \
  --server "psc-tech-server" \
  --name "psc-tech-db" \
  --edition "Standard" \
  --capacity 20 \
  --family "Gen5"

# Configure firewall rules
az sql server firewall-rule create \
  --resource-group "psc-tech-rg" \
  --server "psc-tech-server" \
  --name "AllowAzureServices" \
  --start-ip-address "0.0.0.0" \
  --end-ip-address "0.0.0.0"

az sql server firewall-rule create \
  --resource-group "psc-tech-rg" \
  --server "psc-tech-server" \
  --name "AllowMyIP" \
  --start-ip-address "YOUR_IP_ADDRESS" \
  --end-ip-address "YOUR_IP_ADDRESS"
```

### Step 2: Configure Database Settings

#### Connect to Your Database

1. **Get Connection String**
   - Go to your SQL Database in Azure Portal
   - Click "Connection strings"
   - Copy the ADO.NET connection string

2. **Connect via SSMS or Azure Data Studio**
   ```
   Server: psc-tech-server.database.windows.net
   Database: psc-tech-db
   Authentication: SQL Server Authentication
   Login: psc_admin
   Password: [Your password]
   ```

#### Configure Database Settings

```sql
-- Set database compatibility level
ALTER DATABASE CURRENT SET COMPATIBILITY_LEVEL = 160;

-- Enable Query Store
ALTER DATABASE CURRENT SET QUERY_STORE = ON;
ALTER DATABASE CURRENT SET QUERY_STORE (OPERATION_MODE = READ_WRITE);

-- Set timezone (optional)
-- Azure SQL uses UTC by default, handle timezone in application layer

-- Configure database options
ALTER DATABASE CURRENT SET AUTO_CLOSE OFF;
ALTER DATABASE CURRENT SET AUTO_SHRINK OFF;
ALTER DATABASE CURRENT SET READ_COMMITTED_SNAPSHOT ON;
```

### Step 3: Deploy Database Schema

#### Execute Schema Script

1. **Open the Azure SQL Schema File**
   - Use `azure-sql-schema.sql` from your project
   - Open in SSMS or Azure Data Studio

2. **Execute the Script**
   - Connect to your database
   - Execute the entire script
   - Verify all tables are created successfully

3. **Verify Deployment**
   ```sql
   -- Check tables created
   SELECT TABLE_NAME, TABLE_TYPE 
   FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_TYPE = 'BASE TABLE'
   ORDER BY TABLE_NAME;

   -- Check indexes
   SELECT 
       t.name AS TableName,
       i.name AS IndexName,
       i.type_desc AS IndexType
   FROM sys.tables t
   INNER JOIN sys.indexes i ON t.object_id = i.object_id
   WHERE i.is_hypothetical = 0
   ORDER BY t.name, i.name;
   ```

### Step 4: Configure Security and Access

#### Create Application User

```sql
-- Create application user (for your PSC Tech app)
CREATE USER [psc_app_user] WITHOUT LOGIN;

-- Create application role
CREATE ROLE [psc_app_role];

-- Grant permissions to role
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO [psc_app_role];
GRANT EXECUTE ON SCHEMA::dbo TO [psc_app_role];

-- Add user to role
ALTER ROLE [psc_app_role] ADD MEMBER [psc_app_user];
```

#### Configure Row-Level Security (Optional)

```sql
-- Example: Institution-based row-level security
CREATE FUNCTION dbo.fn_institution_filter(@institution_id UNIQUEIDENTIFIER)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS fn_securitypredicate_result
WHERE @institution_id = CAST(SESSION_CONTEXT(N'institution_id') AS UNIQUEIDENTIFIER);

-- Apply to users table
CREATE SECURITY POLICY InstitutionFilterPolicy
ADD FILTER PREDICATE dbo.fn_institution_filter(institution_id)
ON dbo.users;
```

### Step 5: Performance Optimization

#### Configure Indexes

```sql
-- Update statistics after initial data load
UPDATE STATISTICS institutions;
UPDATE STATISTICS users;
UPDATE STATISTICS students;
UPDATE STATISTICS teachers;
UPDATE STATISTICS classes;
UPDATE STATISTICS attendance;
UPDATE STATISTICS assignments;
UPDATE STATISTICS grades;

-- Analyze index usage
SELECT 
    OBJECT_NAME(i.object_id) AS TableName,
    i.name AS IndexName,
    ius.user_seeks,
    ius.user_scans,
    ius.user_lookups,
    ius.user_updates
FROM sys.dm_db_index_usage_stats ius
INNER JOIN sys.indexes i ON ius.object_id = i.object_id
WHERE ius.database_id = DB_ID()
ORDER BY (ius.user_seeks + ius.user_scans + ius.user_lookups) DESC;
```

#### Configure Query Store

```sql
-- Configure Query Store for performance monitoring
ALTER DATABASE CURRENT SET QUERY_STORE = ON;
ALTER DATABASE CURRENT SET QUERY_STORE (
    OPERATION_MODE = READ_WRITE,
    CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30),
    DATA_FLUSH_INTERVAL_SECONDS = 900,
    MAX_STORAGE_SIZE_MB = 1000,
    INTERVAL_LENGTH_MINUTES = 60
);
```

## 🔧 Configuration Options

### Service Tier Selection

| Tier | Use Case | DTUs/vCores | Storage | Cost |
|------|----------|-------------|---------|------|
| **Basic** | Development/Testing | 5 DTUs | 2 GB | Low |
| **Standard** | Small Production | 10-100 DTUs | 250 GB | Medium |
| **Premium** | High Performance | 125-4000 DTUs | 500 GB | High |
| **Business Critical** | Mission Critical | 4-80 vCores | 1 TB | Very High |

### Recommended Configuration for PSC Tech

#### Development Environment
```
Service Tier: Basic (B)
DTUs: 5
Storage: 2 GB
Estimated Cost: $5-10/month
```

#### Small Production (1-5 schools)
```
Service Tier: Standard (S1)
DTUs: 20
Storage: 20 GB
Estimated Cost: $30-50/month
```

#### Medium Production (5-20 schools)
```
Service Tier: Standard (S2)
DTUs: 50
Storage: 50 GB
Estimated Cost: $75-100/month
```

#### Large Production (20+ schools)
```
Service Tier: Premium (P1)
DTUs: 125
Storage: 100 GB
Estimated Cost: $200-300/month
```

## 🔐 Security Best Practices

### Network Security

1. **Firewall Rules**
   - Only allow necessary IP addresses
   - Use Azure Private Link for VNet integration
   - Enable Azure services access only when needed

2. **Connection Security**
   - Always use encrypted connections (TLS 1.2+)
   - Use connection pooling in your application
   - Implement retry logic with exponential backoff

### Authentication & Authorization

1. **Use Azure AD Authentication** (Recommended)
   - Integrate with your organization's identity provider
   - Enable Multi-Factor Authentication
   - Use managed identities for Azure services

2. **SQL Authentication** (Alternative)
   - Use strong passwords
   - Rotate passwords regularly
   - Limit admin account usage

### Data Protection

1. **Encryption**
   - Data at rest: Always encrypted (default)
   - Data in transit: TLS encryption (default)
   - Transparent Data Encryption (TDE): Enabled by default

2. **Backup & Recovery**
   - Automated backups: 7-35 days retention
   - Point-in-time restore: Available
   - Geo-redundant backup storage

## 📊 Monitoring & Maintenance

### Performance Monitoring

#### Query Store Analysis

```sql
-- Top queries by execution time
SELECT TOP 10
    qsqt.query_sql_text,
    qsrs.avg_duration,
    qsrs.execution_count,
    qsrs.avg_cpu_time
FROM sys.query_store_query_text qsqt
INNER JOIN sys.query_store_query qsq ON qsqt.query_text_id = qsq.query_text_id
INNER JOIN sys.query_store_plan qsp ON qsq.query_id = qsp.query_id
INNER JOIN sys.query_store_runtime_stats qsrs ON qsp.plan_id = qsrs.plan_id
ORDER BY qsrs.avg_duration DESC;
```

#### Resource Utilization

```sql
-- Check DTU/vCore usage
SELECT 
    start_time,
    end_time,
    avg_cpu_percent,
    avg_data_io_percent,
    avg_log_write_percent
FROM sys.dm_db_resource_stats
ORDER BY start_time DESC;
```

### Maintenance Tasks

#### Weekly Tasks
```sql
-- Update statistics
UPDATE STATISTICS institutions;
UPDATE STATISTICS users;
UPDATE STATISTICS students;
UPDATE STATISTICS teachers;

-- Check index fragmentation
SELECT 
    OBJECT_NAME(ind.OBJECT_ID) AS TableName,
    ind.name AS IndexName,
    indexstats.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, NULL) indexstats
INNER JOIN sys.indexes ind ON indexstats.object_id = ind.object_id
WHERE indexstats.avg_fragmentation_in_percent > 30;
```

#### Monthly Tasks
```sql
-- Rebuild fragmented indexes
ALTER INDEX [IX_users_institution] ON [users] REBUILD;

-- Clean up Query Store
EXEC sp_query_store_cleanup;

-- Check database size growth
SELECT 
    name,
    size * 8 / 1024 AS SizeMB,
    max_size * 8 / 1024 AS MaxSizeMB
FROM sys.database_files;
```

## 🚨 Troubleshooting

### Common Issues

#### Connection Issues
```
Error: Cannot connect to server
Solution: Check firewall rules, verify server name, check credentials
```

#### Performance Issues
```
Error: Slow queries, high DTU usage
Solution: Check Query Store, optimize indexes, review query patterns
```

#### Storage Issues
```
Error: Database full, cannot insert data
Solution: Increase storage, clean up old data, check growth patterns
```

### Diagnostic Queries

```sql
-- Check active connections
SELECT 
    session_id,
    login_name,
    host_name,
    program_name,
    status,
    cpu_time,
    memory_usage
FROM sys.dm_exec_sessions
WHERE is_user_process = 1;

-- Check blocking queries
SELECT 
    blocking.session_id AS blocking_session_id,
    blocked.session_id AS blocked_session_id,
    blocking.wait_type,
    blocking.wait_time,
    blocking.wait_resource
FROM sys.dm_exec_requests blocked
INNER JOIN sys.dm_exec_requests blocking ON blocked.blocking_session_id = blocking.session_id
WHERE blocked.blocking_session_id > 0;
```

## 🔄 Backup & Recovery

### Backup Strategy

1. **Automated Backups**
   - Full backups: Daily
   - Differential backups: Every 4 hours
   - Transaction log backups: Every 5 minutes
   - Retention: 7-35 days (configurable)

2. **Manual Backups**
   ```sql
   -- Create manual backup
   BACKUP DATABASE [psc-tech-db] 
   TO URL = 'https://yourstorageaccount.blob.core.windows.net/backups/psc-tech-db.bak'
   WITH COMPRESSION, CHECKSUM;
   ```

### Recovery Options

1. **Point-in-Time Restore**
   - Restore to any point within retention period
   - Useful for accidental data changes
   - Minimal downtime

2. **Geo-Restore**
   - Restore to different region
   - Disaster recovery scenario
   - Longer recovery time

## 📈 Scaling & Optimization

### Vertical Scaling

```sql
-- Scale up (increase DTUs/vCores)
-- Done through Azure Portal or CLI
-- No downtime required
```

### Horizontal Scaling

1. **Read Replicas**
   - Distribute read workload
   - Geographic distribution
   - Near real-time synchronization

2. **Elastic Pools**
   - Multiple databases sharing resources
   - Cost optimization for multiple schools
   - Predictable performance

### Performance Tuning

```sql
-- Enable Query Store hints
EXEC sp_query_store_set_hints @query_id = 1, @query_hint_text = 'OPTION(OPTIMIZE FOR UNKNOWN)';

-- Create filtered indexes for specific queries
CREATE NONCLUSTERED INDEX IX_students_active 
ON students(current_class_id, enrollment_status) 
INCLUDE (student_number, user_id)
WHERE enrollment_status = 'enrolled';
```

## 🔮 Future Enhancements

### Advanced Features

1. **In-Memory OLTP**
   - High-performance tables
   - Requires Premium/Business Critical tier
   - Suitable for attendance and grades tables

2. **Columnstore Indexes**
   - Analytics and reporting queries
   - Data compression
   - Batch mode execution

3. **Intelligent Query Processing**
   - Automatic tuning
   - Adaptive joins
   - Interleaved execution

### Integration Options

1. **Azure Data Factory**
   - ETL processes
   - Data integration
   - Scheduled data movement

2. **Azure Synapse Analytics**
   - Big data analytics
   - Data warehouse
   - Machine learning integration

3. **Power BI Integration**
   - Real-time dashboards
   - Advanced analytics
   - Self-service reporting

## 📞 Support & Resources

### Microsoft Support

- **Azure Support Plans**: Basic, Developer, Standard, Professional Direct
- **Documentation**: [docs.microsoft.com/azure/azure-sql](https://docs.microsoft.com/azure/azure-sql)
- **Community**: [Stack Overflow](https://stackoverflow.com/questions/tagged/azure-sql-database)

### PSC Tech Specific

- **Schema Documentation**: `DATABASE_SCHEMA_DOCUMENTATION.md`
- **Azure Schema**: `azure-sql-schema.sql`
- **Performance Monitoring**: Query Store and Azure Monitor

---

This deployment guide ensures that your PSC Tech database is properly configured on Azure SQL Database with optimal performance, security, and scalability for your school management system.


