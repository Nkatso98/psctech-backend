# Multi-Tenant Azure SQL Architecture Implementation Guide

## 🚀 Quick Start: Fix Current Errors First

### Step 1: Fix Immediate Issues
Run the `fix-current-errors.sql` script first to resolve your current 500 errors:

```sql
-- This fixes:
-- 1. StartTime column truncation in StudySessions table
-- 2. CHECK constraint issues in institutions table
-- 3. Missing performance indexes
```

### Step 2: Test Your API
After running the fix script, test your Study Sessions API:

```json
POST /api/Study/session
{
  "userId": "test-user-123",
  "institutionId": "test-inst-456", 
  "subject": "Mathematics",
  "topic": "Algebra",
  "dayOfWeek": 1,
  "startTime": "14:30",
  "durationMinutes": 60,
  "reminderMinutesBefore": 15
}
```

## 🏗️ Multi-Tenant Architecture Overview

### Current State vs. Target State

| Aspect | Current (Single DB) | Target (Multi-Tenant) |
|--------|---------------------|----------------------|
| **Database** | 1 database (`psctech_main`) | 1 master + N tenant databases |
| **Isolation** | Row-level (institution_id) | Database-level isolation |
| **Scalability** | Limited to single DB | 500+ institutions supported |
| **Security** | Shared schema | Complete tenant isolation |
| **Performance** | Single DB load | Distributed load across DBs |

### Architecture Benefits

✅ **Security**: Complete data isolation between institutions  
✅ **Scalability**: Support 500+ institutions without performance degradation  
✅ **Compliance**: GDPR, data residency, and regulatory compliance  
✅ **Performance**: Each institution gets dedicated database resources  
✅ **Maintenance**: Independent backup, restore, and maintenance per tenant  

## 📋 Implementation Steps

### Phase 1: Master Database Setup

1. **Run the multi-tenant architecture script**:
   ```sql
   -- Execute multi-tenant-azure-sql-architecture.sql on psctech_main
   ```

2. **Verify master tables created**:
   - `tenant_registry` - Central tenant management
   - `tenant_provisioning_log` - Audit trail
   - `global_config` - System configuration

### Phase 2: Create First Tenant

```sql
-- Create your first institution as a tenant
EXEC dbo.sp_create_tenant 
    @tenantCode = 'SCHOOL001',
    @tenantName = 'Your School Name',
    @subscriptionPlan = 'premium',
    @institutionName = 'Your School Name',
    @principalName = 'Principal Name',
    @email = 'principal@yourschool.edu.ng',
    @phone = '+2348012345678',
    @address = 'School Address',
    @schoolType = 'Secondary School',
    @username = 'principal.username',
    @password = 'hashed_password_here';
```

### Phase 3: Update Your API

#### Current API Structure
```csharp
// Your current StudyController
[HttpPost("session")]
public async Task<ActionResult<ApiResponse<StudySessionResponse>>> CreateSession([FromBody] CreateSessionRequest req)
{
    // Currently connects to psctech_main
    // Needs to route to tenant-specific database
}
```

#### New Multi-Tenant Structure
```csharp
// New approach - route to tenant database
[HttpPost("session")]
public async Task<ActionResult<ApiResponse<StudySessionResponse>>> CreateSession([FromBody] CreateSessionRequest req)
{
    // 1. Extract tenant from request or user context
    var tenantCode = GetTenantCode(req.InstitutionId);
    
    // 2. Get tenant database connection
    var tenantDb = await GetTenantDatabase(tenantCode);
    
    // 3. Execute query on tenant database
    var result = await tenantDb.StudySessions.AddAsync(session);
}
```

### Phase 4: Database Routing Layer

Create a service to handle tenant database routing:

```csharp
public interface ITenantService
{
    Task<string> GetTenantDatabaseName(string institutionId);
    Task<DbContext> GetTenantDbContext(string tenantCode);
    Task<bool> IsTenantActive(string tenantCode);
}

public class TenantService : ITenantService
{
    private readonly PscTechDbContext _masterContext;
    
    public async Task<string> GetTenantDatabaseName(string institutionId)
    {
        // Query master database to get tenant info
        var tenant = await _masterContext.tenant_registry
            .Where(t => t.tenant_code == institutionId)
            .Select(t => t.database_name)
            .FirstOrDefaultAsync();
            
        return tenant ?? throw new TenantNotFoundException(institutionId);
    }
    
    public async Task<DbContext> GetTenantDbContext(string tenantCode)
    {
        var databaseName = await GetTenantDatabaseName(tenantCode);
        var connectionString = BuildTenantConnectionString(databaseName);
        
        return new PscTechDbContext(connectionString);
    }
}
```

## 🔧 Configuration Updates

### Connection String Management

#### Master Database
```json
{
  "ConnectionStrings": {
    "MasterDatabase": "Server=your-server.database.windows.net;Database=psctech_main;Authentication=Active Directory Default;"
  }
}
```

#### Tenant Database Template
```json
{
  "ConnectionStrings": {
    "TenantTemplate": "Server=your-server.database.windows.net;Database={0};Authentication=Active Directory Default;"
  }
}
```

### Environment Variables
```bash
# Azure Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_RESOURCE_GROUP=your-resource-group
AZURE_SQL_SERVER=your-sql-server

# Application Settings
MAX_TENANTS_PER_SERVER=100
DEFAULT_STORAGE_GB=1.0
BACKUP_RETENTION_DAYS=30
```

## 📊 Monitoring and Management

### Tenant Health Dashboard

```sql
-- View tenant health status
SELECT * FROM dbo.vw_tenant_health;

-- Monitor inactive tenants
EXEC dbo.sp_suspend_inactive_tenants @daysInactive = 90;

-- Check tenant storage usage
SELECT 
    tenant_code,
    database_name,
    storage_gb,
    last_activity
FROM dbo.tenant_registry 
WHERE subscription_status = 'active';
```

### Performance Monitoring

```sql
-- Check tenant database performance
SELECT 
    database_name,
    size_mb,
    log_size_mb,
    last_backup_date
FROM sys.dm_db_log_stats
WHERE database_id IN (
    SELECT database_id 
    FROM sys.databases 
    WHERE name LIKE 'psctech_%'
);
```

## 🚨 Migration Strategy

### Option 1: Gradual Migration (Recommended)

1. **Keep existing data** in `psctech_main`
2. **Create new tenants** using the new architecture
3. **Migrate existing institutions** one by one
4. **Update API routing** gradually

### Option 2: Full Migration

1. **Backup all existing data**
2. **Create tenant databases** for all institutions
3. **Migrate data** using the migration procedure
4. **Switch API routing** completely

## 🔒 Security Considerations

### Tenant Isolation
- Each tenant gets a separate database
- No cross-tenant data access possible
- Independent user authentication per tenant

### Access Control
```sql
-- Grant minimal permissions to application user
GRANT SELECT, INSERT, UPDATE ON dbo.tenant_registry TO [psctech_app];
GRANT EXECUTE ON dbo.sp_create_tenant TO [psctech_app];

-- Restrict access to master database
DENY SELECT, INSERT, UPDATE, DELETE ON dbo.tenant_registry TO [tenant_users];
```

## 📈 Scaling Considerations

### Azure SQL Database Tiers

| Tenant Count | Database Tier | Cost Optimization |
|--------------|---------------|-------------------|
| 1-50 | Basic (5 DTUs) | Standard tier for all |
| 51-200 | Standard (S1-S3) | Mix of tiers based on usage |
| 201-500 | Premium (P1-P4) | Auto-scaling with usage patterns |
| 500+ | Hyperscale | Geographic distribution |

### Resource Allocation

```sql
-- Monitor resource usage per tenant
SELECT 
    tenant_code,
    database_name,
    subscription_plan,
    max_users,
    max_students,
    storage_gb
FROM dbo.tenant_registry 
WHERE subscription_status = 'active'
ORDER BY storage_gb DESC;
```

## 🧪 Testing Strategy

### Unit Tests
```csharp
[Test]
public async Task CreateTenant_ValidData_ShouldSucceed()
{
    // Test tenant creation
    var result = await _tenantService.CreateTenant(validTenantData);
    Assert.IsTrue(result.Success);
}
```

### Integration Tests
```csharp
[Test]
public async Task StudySession_CreateInTenant_ShouldIsolateData()
{
    // Create session in tenant A
    var sessionA = await CreateSessionInTenant("TENANT_A", sessionData);
    
    // Verify it's not visible in tenant B
    var sessionsB = await GetSessionsInTenant("TENANT_B");
    Assert.IsFalse(sessionsB.Any(s => s.Id == sessionA.Id));
}
```

## 📞 Support and Troubleshooting

### Common Issues

1. **Tenant Database Not Found**
   - Check tenant registry in master database
   - Verify database exists in Azure SQL
   - Check connection string permissions

2. **Performance Issues**
   - Monitor tenant database resource usage
   - Check for missing indexes
   - Review query performance

3. **Data Migration Errors**
   - Verify data integrity before migration
   - Check foreign key constraints
   - Review data type compatibility

### Debug Commands

```sql
-- Check tenant status
SELECT * FROM dbo.tenant_registry WHERE tenant_code = 'YOUR_TENANT';

-- View provisioning logs
SELECT * FROM dbo.tenant_provisioning_log WHERE tenant_id = 'TENANT_ID';

-- Check database connectivity
SELECT name, state_desc FROM sys.databases WHERE name LIKE 'psctech_%';
```

## 🎯 Next Steps

1. **Run the fix script** to resolve current errors
2. **Implement the master database** structure
3. **Create your first tenant** database
4. **Update your API** to use tenant routing
5. **Test thoroughly** with multiple tenants
6. **Monitor performance** and scale as needed

## 📚 Additional Resources

- [Azure SQL Database Documentation](https://docs.microsoft.com/en-us/azure/azure-sql/)
- [Multi-Tenant Database Design Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/)
- [Azure SQL Performance Tuning](https://docs.microsoft.com/en-us/azure/azure-sql/database/performance-guidance)

---

**Need Help?** Contact your development team or Azure support for assistance with the implementation.

