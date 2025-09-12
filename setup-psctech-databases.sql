-- PSCTECH Multi-Tenant Database Setup Script
-- AWS RDS SQL Server Configuration
-- Endpoint: psctech-sql.c7uk4kuu8et5.eu-north-1.rds.amazonaws.com,1433
-- Username: psctechadmin

-- =====================================================
-- STEP 1: CREATE MASTER DATABASE
-- =====================================================

PRINT 'Setting up PSCTECH Master Database...';

-- Create master database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'psctech_master')
BEGIN
    CREATE DATABASE psctech_master;
    PRINT '✓ Master database created: psctech_master';
END
ELSE
BEGIN
    PRINT '✓ Master database already exists: psctech_master';
END
GO

USE psctech_master;
GO

-- =====================================================
-- STEP 2: CREATE MASTER DATABASE TABLES
-- =====================================================

PRINT 'Creating master database tables...';

-- Tenant Registry - Main tenant information
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tenant_registry]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[tenant_registry] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [tenant_code] NVARCHAR(20) UNIQUE NOT NULL,
        [tenant_name] NVARCHAR(255) NOT NULL,
        [database_name] NVARCHAR(128) UNIQUE NOT NULL,
        [server_endpoint] NVARCHAR(255) NOT NULL,
        [connection_string] NVARCHAR(MAX) NOT NULL,
        [subscription_plan] NVARCHAR(50) NOT NULL DEFAULT 'basic',
        [subscription_status] NVARCHAR(20) NOT NULL DEFAULT 'active',
        [subscription_expiry] DATETIME2,
        [max_users] INT DEFAULT 100,
        [max_students] INT DEFAULT 500,
        [max_storage_gb] INT DEFAULT 10,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        [created_by] UNIQUEIDENTIFIER,
        [metadata] NVARCHAR(MAX) -- JSON data
    );
    PRINT '✓ tenant_registry table created';
END

-- Subscription Plans
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[subscription_plans]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[subscription_plans] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [plan_code] NVARCHAR(50) UNIQUE NOT NULL,
        [plan_name] NVARCHAR(100) NOT NULL,
        [description] NVARCHAR(MAX),
        [price_monthly] DECIMAL(10,2) NOT NULL,
        [price_yearly] DECIMAL(10,2) NOT NULL,
        [currency] NVARCHAR(3) DEFAULT 'USD',
        [max_users] INT NOT NULL,
        [max_students] INT NOT NULL,
        [max_storage_gb] INT NOT NULL,
        [max_vouchers_per_month] INT NOT NULL,
        [features] NVARCHAR(MAX) NOT NULL, -- JSON data
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT '✓ subscription_plans table created';
END

-- Super Admin Users
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[super_admin_users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[super_admin_users] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [username] NVARCHAR(100) UNIQUE NOT NULL,
        [email] NVARCHAR(255) UNIQUE NOT NULL,
        [password_hash] NVARCHAR(255) NOT NULL,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [role] NVARCHAR(20) NOT NULL DEFAULT 'superadmin',
        [is_active] BIT DEFAULT 1,
        [last_login] DATETIME2,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT '✓ super_admin_users table created';
END

-- System Configuration
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[system_config]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[system_config] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [config_key] NVARCHAR(100) UNIQUE NOT NULL,
        [config_value] NVARCHAR(MAX) NOT NULL,
        [config_type] NVARCHAR(50) DEFAULT 'string',
        [description] NVARCHAR(MAX),
        [is_encrypted] BIT DEFAULT 0,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT '✓ system_config table created';
END

-- =====================================================
-- STEP 3: INSERT INITIAL DATA
-- =====================================================

PRINT 'Inserting initial data...';

-- Insert default subscription plans
IF NOT EXISTS (SELECT * FROM [dbo].[subscription_plans] WHERE [plan_code] = 'basic')
BEGIN
    INSERT INTO [dbo].[subscription_plans] ([plan_code], [plan_name], [description], [price_monthly], [price_yearly], [max_users], [max_students], [max_storage_gb], [max_vouchers_per_month], [features]) VALUES
    ('basic', 'Basic Plan', 'Essential features for small institutions', 99.99, 999.99, 100, 500, 10, 1000, '["Basic voucher system", "Standard support", "Email notifications", "Basic analytics"]');
    PRINT '✓ Basic subscription plan created';
END

IF NOT EXISTS (SELECT * FROM [dbo].[subscription_plans] WHERE [plan_code] = 'premium')
BEGIN
    INSERT INTO [dbo].[subscription_plans] ([plan_code], [plan_name], [description], [price_monthly], [price_yearly], [max_users], [max_students], [max_storage_gb], [max_vouchers_per_month], [features]) VALUES
    ('premium', 'Premium Plan', 'Advanced features for growing institutions', 199.99, 1999.99, 500, 2000, 50, 5000, '["Advanced voucher system", "Priority support", "SMS notifications", "Advanced analytics", "Custom branding", "API access"]');
    PRINT '✓ Premium subscription plan created';
END

IF NOT EXISTS (SELECT * FROM [dbo].[subscription_plans] WHERE [plan_code] = 'enterprise')
BEGIN
    INSERT INTO [dbo].[subscription_plans] ([plan_code], [plan_name], [description], [price_monthly], [price_yearly], [max_users], [max_students], [max_storage_gb], [max_vouchers_per_month], [features]) VALUES
    ('enterprise', 'Enterprise Plan', 'Full-featured solution for large institutions', 399.99, 3999.99, 2000, 10000, 200, 20000, '["Full voucher system", "24/7 support", "Custom integrations", "Advanced analytics", "Custom branding", "API access", "White-label options", "Dedicated support"]');
    PRINT '✓ Enterprise subscription plan created';
END

-- Insert default super admin
IF NOT EXISTS (SELECT * FROM [dbo].[super_admin_users] WHERE [username] = 'superadmin')
BEGIN
    INSERT INTO [dbo].[super_admin_users] ([username], [email], [password_hash], [first_name], [last_name], [role]) VALUES
    ('superadmin', 'admin@psctech.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Super', 'Administrator', 'superadmin');
    PRINT '✓ Super admin user created';
END

-- Insert system configuration
IF NOT EXISTS (SELECT * FROM [dbo].[system_config] WHERE [config_key] = 'default_subscription_plan')
BEGIN
    INSERT INTO [dbo].[system_config] ([config_key], [config_value], [config_type], [description]) VALUES
    ('default_subscription_plan', 'basic', 'string', 'Default subscription plan for new tenants');
END

IF NOT EXISTS (SELECT * FROM [dbo].[system_config] WHERE [config_key] = 'server_endpoint')
BEGIN
    INSERT INTO [dbo].[system_config] ([config_key], [config_value], [config_type], [description]) VALUES
    ('server_endpoint', 'psctech-sql.c7uk4kuu8et5.eu-north-1.rds.amazonaws.com,1433', 'string', 'AWS RDS SQL Server endpoint');
END

IF NOT EXISTS (SELECT * FROM [dbo].[system_config] WHERE [config_key] = 'database_username')
BEGIN
    INSERT INTO [dbo].[system_config] ([config_key], [config_value], [config_type], [description]) VALUES
    ('database_username', 'psctechadmin', 'string', 'Database username');
END

-- =====================================================
-- STEP 4: CREATE STORED PROCEDURES
-- =====================================================

PRINT 'Creating stored procedures...';

-- Create new tenant procedure
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[create_tenant]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[create_tenant]
GO

CREATE PROCEDURE [dbo].[create_tenant]
    @p_tenant_code NVARCHAR(20),
    @p_tenant_name NVARCHAR(255),
    @p_database_name NVARCHAR(128),
    @p_subscription_plan NVARCHAR(50) = 'basic',
    @p_created_by UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @v_tenant_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @v_server_endpoint NVARCHAR(255) = 'psctech-sql.c7uk4kuu8et5.eu-north-1.rds.amazonaws.com,1433';
    DECLARE @v_connection_string NVARCHAR(MAX) = 'Server=' + @v_server_endpoint + ';Database=' + @p_database_name + ';User Id=psctechadmin;Password=Rluthando123;TrustServerCertificate=true;';
    
    INSERT INTO [dbo].[tenant_registry] (
        [id], [tenant_code], [tenant_name], [database_name], [server_endpoint], 
        [connection_string], [subscription_plan], [created_by]
    ) VALUES (
        @v_tenant_id, @p_tenant_code, @p_tenant_name, @p_database_name, @v_server_endpoint,
        @v_connection_string, @p_subscription_plan, @p_created_by
    );
    
    SELECT @v_tenant_id AS tenant_id, @p_database_name AS database_name, @v_connection_string AS connection_string;
END
GO

PRINT '✓ create_tenant stored procedure created';

-- Get tenant connection info procedure
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[get_tenant_connection]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[get_tenant_connection]
GO

CREATE PROCEDURE [dbo].[get_tenant_connection]
    @p_tenant_code NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT [database_name], [connection_string], [is_active]
    FROM [dbo].[tenant_registry]
    WHERE [tenant_code] = @p_tenant_code;
END
GO

PRINT '✓ get_tenant_connection stored procedure created';

-- =====================================================
-- STEP 5: CREATE SAMPLE TENANT DATABASE
-- =====================================================

PRINT 'Creating sample tenant database...';

DECLARE @sampleDbName NVARCHAR(128) = 'psctech_tenant_DEMO001';
DECLARE @sql NVARCHAR(MAX);

-- Create sample tenant database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = @sampleDbName)
BEGIN
    SET @sql = 'CREATE DATABASE [' + @sampleDbName + ']';
    EXEC sp_executesql @sql;
    PRINT '✓ Sample tenant database created: ' + @sampleDbName;
END
ELSE
BEGIN
    PRINT '✓ Sample tenant database already exists: ' + @sampleDbName;
END

-- Register the sample tenant
IF NOT EXISTS (SELECT * FROM [dbo].[tenant_registry] WHERE [tenant_code] = 'DEMO001')
BEGIN
    EXEC [dbo].[create_tenant] 
        @p_tenant_code = 'DEMO001',
        @p_tenant_name = 'Demo School',
        @p_database_name = @sampleDbName,
        @p_subscription_plan = 'basic';
    PRINT '✓ Sample tenant registered in master database';
END
ELSE
BEGIN
    PRINT '✓ Sample tenant already registered';
END

-- =====================================================
-- STEP 6: VERIFICATION
-- =====================================================

PRINT '';
PRINT '========================================';
PRINT 'PSCTECH DATABASE SETUP VERIFICATION';
PRINT '========================================';

-- Check master database tables
DECLARE @tableCount INT = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE');
PRINT 'Master database tables: ' + CAST(@tableCount AS NVARCHAR(10));

-- Check subscription plans
DECLARE @planCount INT = (SELECT COUNT(*) FROM [dbo].[subscription_plans]);
PRINT 'Subscription plans: ' + CAST(@planCount AS NVARCHAR(10));

-- Check super admin users
DECLARE @adminCount INT = (SELECT COUNT(*) FROM [dbo].[super_admin_users]);
PRINT 'Super admin users: ' + CAST(@adminCount AS NVARCHAR(10));

-- Check registered tenants
DECLARE @tenantCount INT = (SELECT COUNT(*) FROM [dbo].[tenant_registry]);
PRINT 'Registered tenants: ' + CAST(@tenantCount AS NVARCHAR(10));

-- List all databases
PRINT '';
PRINT 'Available databases:';
SELECT name AS database_name FROM sys.databases WHERE name LIKE 'psctech_%' ORDER BY name;

PRINT '';
PRINT '========================================';
PRINT 'SETUP COMPLETED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Run aws-tenant-database-core.sql on each tenant database';
PRINT '2. Run aws-tenant-database-extended.sql for advanced features';
PRINT '3. Update your .NET backend connection strings';
PRINT '4. Test all PSCTECH features';
PRINT '';
PRINT 'Connection Details:';
PRINT 'Server: psctech-sql.c7uk4kuu8et5.eu-north-1.rds.amazonaws.com,1433';
PRINT 'Username: psctechadmin';
PRINT 'Master Database: psctech_master';
PRINT 'Sample Tenant: psctech_tenant_DEMO001';
PRINT '========================================';








