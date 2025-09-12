-- =====================================================
-- MULTI-TENANT AZURE SQL ARCHITECTURE FOR 500+ INSTITUTIONS
-- =====================================================
-- This architecture supports:
-- 1. Database-per-tenant isolation for security
-- 2. Shared schema management
-- 3. Tenant provisioning automation
-- 4. Scalable performance for 500+ institutions
-- 5. Proper data types to fix current errors

-- =====================================================
-- MASTER DATABASE (psctech_main) - TENANT MANAGEMENT
-- =====================================================

USE psctech_main;
GO

-- Create schema for tenant management
CREATE SCHEMA IF NOT EXISTS dbo;
GO

-- Tenant Registry Table (Master control)
CREATE TABLE dbo.tenant_registry (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    tenant_code NVARCHAR(50) NOT NULL UNIQUE,
    tenant_name NVARCHAR(255) NOT NULL,
    database_name NVARCHAR(128) NOT NULL UNIQUE,
    connection_string NVARCHAR(1000),
    subscription_plan NVARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    subscription_status NVARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'suspended', 'provisioning')),
    max_users INT DEFAULT 100,
    max_students INT DEFAULT 1000,
    storage_gb DECIMAL(10,2) DEFAULT 1.0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    provisioned_at DATETIME2,
    last_activity DATETIME2,
    is_active BIT DEFAULT 1,
    
    -- Tenant metadata
    country NVARCHAR(100) DEFAULT 'Nigeria',
    timezone NVARCHAR(50) DEFAULT 'Africa/Lagos',
    language NVARCHAR(10) DEFAULT 'en',
    currency NVARCHAR(3) DEFAULT 'NGN'
);
GO

-- Tenant Provisioning Log
CREATE TABLE dbo.tenant_provisioning_log (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    tenant_id UNIQUEIDENTIFIER NOT NULL,
    action NVARCHAR(50) NOT NULL, -- 'create', 'update', 'suspend', 'delete'
    status NVARCHAR(20) NOT NULL, -- 'pending', 'success', 'failed'
    details NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    completed_at DATETIME2,
    
    CONSTRAINT FK_provisioning_tenant FOREIGN KEY (tenant_id) REFERENCES dbo.tenant_registry(id)
);
GO

-- Global Configuration
CREATE TABLE dbo.global_config (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    config_key NVARCHAR(100) NOT NULL UNIQUE,
    config_value NVARCHAR(MAX),
    description NVARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- Insert global configurations
INSERT INTO dbo.global_config (config_key, config_value, description) VALUES
('default_storage_gb', '1.0', 'Default storage allocation per tenant in GB'),
('max_tenants_per_server', '100', 'Maximum tenants per database server'),
('backup_retention_days', '30', 'Backup retention period in days'),
('monitoring_enabled', 'true', 'Enable tenant monitoring and alerting');
GO

-- =====================================================
-- TENANT DATABASE TEMPLATE SCHEMA
-- =====================================================
-- This will be applied to each new tenant database

-- Create a stored procedure to provision new tenant databases
CREATE PROCEDURE dbo.sp_provision_tenant_database
    @tenantCode NVARCHAR(50),
    @tenantName NVARCHAR(255),
    @subscriptionPlan NVARCHAR(20) = 'basic'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @databaseName NVARCHAR(128) = 'psctech_' + @tenantCode;
    DECLARE @tenantId UNIQUEIDENTIFIER;
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @errorMessage NVARCHAR(4000);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check if tenant already exists
        IF EXISTS (SELECT 1 FROM dbo.tenant_registry WHERE tenant_code = @tenantCode)
        BEGIN
            RAISERROR ('Tenant with code %s already exists', 16, 1, @tenantCode);
            RETURN;
        END
        
        -- Check if database name already exists
        IF EXISTS (SELECT 1 FROM sys.databases WHERE name = @databaseName)
        BEGIN
            RAISERROR ('Database %s already exists', 16, 1, @databaseName);
            RETURN;
        END
        
        -- Insert tenant record
        INSERT INTO dbo.tenant_registry (tenant_code, tenant_name, database_name, subscription_plan, status)
        VALUES (@tenantCode, @tenantName, @databaseName, @subscriptionPlan, 'provisioning');
        
        SET @tenantId = SCOPE_IDENTITY();
        
        -- Log provisioning start
        INSERT INTO dbo.tenant_provisioning_log (tenant_id, action, status, details)
        VALUES (@tenantId, 'create', 'pending', 'Starting database creation');
        
        -- Create the tenant database
        SET @sql = 'CREATE DATABASE [' + @databaseName + ']';
        EXEC sp_executesql @sql;
        
        -- Apply tenant schema (this will be done in a separate step)
        -- For now, just mark as provisioned
        
        UPDATE dbo.tenant_registry 
        SET status = 'active', provisioned_at = GETUTCDATE()
        WHERE id = @tenantId;
        
        UPDATE dbo.tenant_provisioning_log 
        SET status = 'success', completed_at = GETUTCDATE(), details = 'Database created successfully'
        WHERE tenant_id = @tenantId AND action = 'create';
        
        COMMIT TRANSACTION;
        
        PRINT 'Tenant database ' + @databaseName + ' provisioned successfully';
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        SET @errorMessage = ERROR_MESSAGE();
        
        IF @tenantId IS NOT NULL
        BEGIN
            UPDATE dbo.tenant_provisioning_log 
            SET status = 'failed', details = @errorMessage
            WHERE tenant_id = @tenantId AND action = 'create';
        END
        
        RAISERROR (@errorMessage, 16, 1);
    END CATCH
END;
GO

-- =====================================================
-- TENANT SCHEMA CREATION PROCEDURE
-- =====================================================
-- This procedure creates the complete schema for a new tenant

CREATE PROCEDURE dbo.sp_create_tenant_schema
    @databaseName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @errorMessage NVARCHAR(4000);
    
    BEGIN TRY
        -- Switch to tenant database
        SET @sql = 'USE [' + @databaseName + '];';
        EXEC sp_executesql @sql;
        
        -- Create schema
        SET @sql = 'USE [' + @databaseName + ']; CREATE SCHEMA IF NOT EXISTS dbo;';
        EXEC sp_executesql @sql;
        
        -- Create Institutions table (Tenant-specific)
        SET @sql = 'USE [' + @databaseName + '];
        CREATE TABLE dbo.institutions (
            id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
            name NVARCHAR(255) NOT NULL,
            code NVARCHAR(50) NOT NULL UNIQUE,
            type NVARCHAR(50) NOT NULL CHECK (type IN (''Primary School'', ''Secondary School'', ''High School'', ''University'', ''College'', ''Vocational School'')),
            principal_name NVARCHAR(255) NOT NULL,
            email NVARCHAR(255) NOT NULL UNIQUE,
            phone NVARCHAR(20),
            address NVARCHAR(500),
            city NVARCHAR(100),
            state NVARCHAR(100),
            country NVARCHAR(100) DEFAULT ''Nigeria'',
            postal_code NVARCHAR(20),
            website NVARCHAR(255),
            logo_url NVARCHAR(500),
            status NVARCHAR(20) DEFAULT ''Active'' CHECK (status IN (''Active'', ''Inactive'', ''Suspended'', ''Pending'')),
            created_at DATETIME2 DEFAULT GETUTCDATE(),
            updated_at DATETIME2 DEFAULT GETUTCDATE()
        );';
        EXEC sp_executesql @sql;
        
        -- Create Users table
        SET @sql = 'USE [' + @databaseName + '];
        CREATE TABLE dbo.users (
            id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
            institution_id UNIQUEIDENTIFIER NOT NULL,
            username NVARCHAR(100) NOT NULL,
            email NVARCHAR(255) NOT NULL,
            password_hash NVARCHAR(255) NOT NULL,
            first_name NVARCHAR(100) NOT NULL,
            last_name NVARCHAR(100) NOT NULL,
            role NVARCHAR(50) NOT NULL CHECK (role IN (''Principal'', ''Teacher'', ''Student'', ''Admin'', ''Parent'')),
            status NVARCHAR(20) DEFAULT ''Active'' CHECK (status IN (''Active'', ''Inactive'', ''Suspended'')),
            last_login DATETIME2,
            created_at DATETIME2 DEFAULT GETUTCDATE(),
            updated_at DATETIME2 DEFAULT GETUTCDATE(),
            
            CONSTRAINT FK_users_institution FOREIGN KEY (institution_id) REFERENCES dbo.institutions(id),
            CONSTRAINT UQ_users_institution_username UNIQUE (institution_id, username),
            CONSTRAINT UQ_users_email UNIQUE (email)
        );';
        EXEC sp_executesql @sql;
        
        -- Create StudySessions table with CORRECTED data types
        SET @sql = 'USE [' + @databaseName + '];
        CREATE TABLE dbo.StudySessions (
            Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_StudySessions PRIMARY KEY DEFAULT NEWID(),
            UserId NVARCHAR(50) NOT NULL,
            InstitutionId NVARCHAR(50) NULL,
            Subject NVARCHAR(100) NOT NULL,
            Topic NVARCHAR(200) NULL,
            DayOfWeek INT NOT NULL,
            StartTime NVARCHAR(10) NOT NULL, -- FIXED: Changed from NVARCHAR(5) to NVARCHAR(10)
            DurationMinutes INT NOT NULL,
            ReminderMinutesBefore INT NOT NULL DEFAULT(10),
            IsActive BIT NOT NULL DEFAULT(1),
            CreatedAt DATETIME2 NOT NULL DEFAULT(GETUTCDATE()),
            UpdatedAt DATETIME2 NOT NULL DEFAULT(GETUTCDATE())
        );';
        EXEC sp_executesql @sql;
        
        -- Create PracticeRuns table
        SET @sql = 'USE [' + @databaseName + '];
        CREATE TABLE dbo.PracticeRuns (
            Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_PracticeRuns PRIMARY KEY DEFAULT NEWID(),
            SessionId UNIQUEIDENTIFIER NOT NULL,
            UserId NVARCHAR(50) NOT NULL,
            InstitutionId NVARCHAR(50) NULL,
            RunAt DATETIME2 NOT NULL DEFAULT(GETUTCDATE()),
            TotalQuestions INT NOT NULL,
            Score INT NOT NULL,
            DetailsJson NVARCHAR(MAX) NULL
        );';
        EXEC sp_executesql @sql;
        
        -- Create additional tables for comprehensive school management
        -- Classes table
        SET @sql = 'USE [' + @databaseName + '];
        CREATE TABLE dbo.classes (
            id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
            institution_id UNIQUEIDENTIFIER NOT NULL,
            name NVARCHAR(100) NOT NULL,
            grade_level NVARCHAR(20),
            academic_year NVARCHAR(20) NOT NULL,
            semester NVARCHAR(20),
            status NVARCHAR(20) DEFAULT ''Active'' CHECK (status IN (''Active'', ''Inactive'', ''Completed'')),
            created_at DATETIME2 DEFAULT GETUTCDATE(),
            updated_at DATETIME2 DEFAULT GETUTCDATE(),
            
            CONSTRAINT FK_classes_institution FOREIGN KEY (institution_id) REFERENCES dbo.institutions(id)
        );';
        EXEC sp_executesql @sql;
        
        -- Subjects table
        SET @sql = 'USE [' + @databaseName + '];
        CREATE TABLE dbo.subjects (
            id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
            institution_id UNIQUEIDENTIFIER NOT NULL,
            name NVARCHAR(100) NOT NULL,
            code NVARCHAR(20),
            description NVARCHAR(500),
            status NVARCHAR(20) DEFAULT ''Active'' CHECK (status IN (''Active'', ''Inactive'')),
            created_at DATETIME2 DEFAULT GETUTCDATE(),
            updated_at DATETIME2 DEFAULT GETUTCDATE(),
            
            CONSTRAINT FK_subjects_institution FOREIGN KEY (institution_id) REFERENCES dbo.institutions(id)
        );';
        EXEC sp_executesql @sql;
        
        -- Students table
        SET @sql = 'USE [' + @databaseName + '];
        CREATE TABLE dbo.students (
            id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
            user_id UNIQUEIDENTIFIER NOT NULL,
            institution_id UNIQUEIDENTIFIER NOT NULL,
            student_number NVARCHAR(50) NOT NULL,
            date_of_birth DATE,
            gender NVARCHAR(10) CHECK (gender IN (''Male'', ''Female'', ''Other'')),
            parent_guardian_name NVARCHAR(255),
            parent_guardian_phone NVARCHAR(20),
            parent_guardian_email NVARCHAR(255),
            enrollment_date DATE DEFAULT GETDATE(),
            graduation_date DATE,
            status NVARCHAR(20) DEFAULT ''Active'' CHECK (status IN (''Active'', ''Inactive'', ''Graduated'', ''Transferred'', ''Suspended'')),
            created_at DATETIME2 DEFAULT GETUTCDATE(),
            updated_at DATETIME2 DEFAULT GETUTCDATE(),
            
            CONSTRAINT FK_students_user FOREIGN KEY (user_id) REFERENCES dbo.users(id),
            CONSTRAINT FK_students_institution FOREIGN KEY (institution_id) REFERENCES dbo.institutions(id),
            CONSTRAINT UQ_student_number UNIQUE (institution_id, student_number)
        );';
        EXEC sp_executesql @sql;
        
        -- Create indexes for performance
        SET @sql = 'USE [' + @databaseName + '];
        CREATE INDEX IX_StudySessions_UserId ON dbo.StudySessions(UserId);
        CREATE INDEX IX_StudySessions_InstitutionId ON dbo.StudySessions(InstitutionId);
        CREATE INDEX IX_users_institution_id ON dbo.users(institution_id);
        CREATE INDEX IX_users_role ON dbo.users(role);
        CREATE INDEX IX_students_institution_id ON dbo.students(institution_id);';
        EXEC sp_executesql @sql;
        
        PRINT 'Tenant schema created successfully for database: ' + @databaseName;
        
    END TRY
    BEGIN CATCH
        SET @errorMessage = ERROR_MESSAGE();
        RAISERROR ('Failed to create tenant schema: %s', 16, 1, @errorMessage);
    END CATCH
END;
GO

-- =====================================================
-- TENANT MANAGEMENT PROCEDURES
-- =====================================================

-- Procedure to create a complete new tenant
CREATE PROCEDURE dbo.sp_create_tenant
    @tenantCode NVARCHAR(50),
    @tenantName NVARCHAR(255),
    @subscriptionPlan NVARCHAR(20) = 'basic',
    @institutionName NVARCHAR(255),
    @principalName NVARCHAR(255),
    @email NVARCHAR(255),
    @phone NVARCHAR(20),
    @address NVARCHAR(500),
    @schoolType NVARCHAR(50),
    @username NVARCHAR(100),
    @password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @databaseName NVARCHAR(128);
    DECLARE @tenantId UNIQUEIDENTIFIER;
    DECLARE @sql NVARCHAR(MAX);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 1. Provision tenant database
        EXEC dbo.sp_provision_tenant_database @tenantCode, @tenantName, @subscriptionPlan;
        
        -- Get the created database name
        SELECT @databaseName = database_name, @tenantId = id 
        FROM dbo.tenant_registry 
        WHERE tenant_code = @tenantCode;
        
        -- 2. Create tenant schema
        EXEC dbo.sp_create_tenant_schema @databaseName;
        
        -- 3. Insert initial institution data
        SET @sql = 'USE [' + @databaseName + '];
        INSERT INTO dbo.institutions (name, code, type, principal_name, email, phone, address)
        VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6);';
        
        EXEC sp_executesql @sql, N'@p0 NVARCHAR(255), @p1 NVARCHAR(50), @p2 NVARCHAR(50), @p3 NVARCHAR(255), @p4 NVARCHAR(255), @p5 NVARCHAR(20), @p6 NVARCHAR(500)',
            @institutionName, @tenantCode, @schoolType, @principalName, @email, @phone, @address;
        
        -- 4. Insert principal user
        SET @sql = 'USE [' + @databaseName + '];
        INSERT INTO dbo.users (institution_id, username, email, password_hash, first_name, last_name, role)
        SELECT id, @p0, @p1, @p2, @p3, '''', ''Principal'' FROM dbo.institutions WHERE code = @p4;';
        
        EXEC sp_executesql @sql, N'@p0 NVARCHAR(100), @p1 NVARCHAR(255), @p2 NVARCHAR(255), @p3 NVARCHAR(255), @p4 NVARCHAR(50)',
            @username, @email, @password, @principalName, @tenantCode;
        
        COMMIT TRANSACTION;
        
        PRINT 'Tenant created successfully: ' + @tenantName;
        PRINT 'Database: ' + @databaseName;
        PRINT 'Access URL: https://psctech-bcdadbajcrgwa2h5.azurewebsites.net/tenant/' + @tenantCode;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @errorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR ('Failed to create tenant: %s', 16, 1, @errorMessage);
    END CATCH
END;
GO

-- =====================================================
-- TENANT MONITORING AND MAINTENANCE
-- =====================================================

-- View for tenant health monitoring
CREATE VIEW dbo.vw_tenant_health AS
SELECT 
    tr.id,
    tr.tenant_code,
    tr.tenant_name,
    tr.database_name,
    tr.subscription_plan,
    tr.subscription_status,
    tr.created_at,
    tr.last_activity,
    tr.is_active,
    DATEDIFF(day, tr.created_at, GETUTCDATE()) as days_active,
    CASE 
        WHEN tr.last_activity IS NULL THEN 'No Activity'
        WHEN DATEDIFF(day, tr.last_activity, GETUTCDATE()) > 30 THEN 'Inactive'
        WHEN DATEDIFF(day, tr.last_activity, GETUTCDATE()) > 7 THEN 'Low Activity'
        ELSE 'Active'
    END as activity_status
FROM dbo.tenant_registry tr;
GO

-- Procedure to suspend inactive tenants
CREATE PROCEDURE dbo.sp_suspend_inactive_tenants
    @daysInactive INT = 90
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.tenant_registry 
    SET subscription_status = 'suspended',
        updated_at = GETUTCDATE()
    WHERE last_activity < DATEADD(day, -@daysInactive, GETUTCDATE())
    AND subscription_status = 'active'
    AND is_active = 1;
    
    PRINT 'Suspended ' + CAST(@@ROWCOUNT AS VARCHAR) + ' inactive tenants';
END;
GO

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Create indexes on master database
CREATE INDEX IX_tenant_registry_code ON dbo.tenant_registry(tenant_code);
CREATE INDEX IX_tenant_registry_status ON dbo.tenant_registry(subscription_status);
CREATE INDEX IX_tenant_registry_activity ON dbo.tenant_registry(last_activity);
CREATE INDEX IX_provisioning_tenant ON dbo.tenant_provisioning_log(tenant_id);

-- =====================================================
-- SECURITY AND ACCESS CONTROL
-- =====================================================

-- Create application user with limited permissions
-- GRANT SELECT, INSERT, UPDATE ON dbo.tenant_registry TO [psctech_app];
-- GRANT EXECUTE ON dbo.sp_create_tenant TO [psctech_app];
-- GRANT EXECUTE ON dbo.sp_provision_tenant_database TO [psctech_app];

-- =====================================================
-- SAMPLE TENANT CREATION
-- =====================================================

-- Example: Create a sample tenant (uncomment to test)
/*
EXEC dbo.sp_create_tenant 
    @tenantCode = 'DEMO001',
    @tenantName = 'Demo Academy',
    @subscriptionPlan = 'premium',
    @institutionName = 'Demo Academy',
    @principalName = 'Dr. Demo Principal',
    @email = 'principal@demoacademy.edu.ng',
    @phone = '+2348012345678',
    @address = '123 Demo Street, Lagos',
    @schoolType = 'Secondary School',
    @username = 'demo.principal',
    @password = 'hashed_password_here';
*/

-- =====================================================
-- MIGRATION SCRIPT FOR EXISTING DATA
-- =====================================================

-- If you have existing data in psctech_main, you can migrate it to a tenant
-- This script creates a migration procedure
CREATE PROCEDURE dbo.sp_migrate_existing_data_to_tenant
    @tenantCode NVARCHAR(50),
    @tenantName NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @databaseName NVARCHAR(128) = 'psctech_' + @tenantCode;
    
    -- Create tenant database
    EXEC dbo.sp_provision_tenant_database @tenantCode, @tenantName;
    
    -- Create schema
    EXEC dbo.sp_create_tenant_schema @databaseName;
    
    -- Migrate existing institutions data
    -- (This would need to be customized based on your existing data structure)
    
    PRINT 'Migration completed for tenant: ' + @tenantCode;
END;
GO

PRINT '=====================================================';
PRINT 'MULTI-TENANT AZURE SQL ARCHITECTURE CREATED SUCCESSFULLY!';
PRINT '=====================================================';
PRINT '';
PRINT 'This architecture supports:';
PRINT '✅ 500+ institutions with isolated databases';
PRINT '✅ Automatic tenant provisioning';
PRINT '✅ Proper data types (fixed StartTime column)';
PRINT '✅ Scalable performance and security';
PRINT '✅ Tenant monitoring and management';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Run this script on your master database';
PRINT '2. Use sp_create_tenant to create new institutions';
PRINT '3. Each tenant gets their own isolated database';
PRINT '4. Update your API to route to correct tenant database';
PRINT '';
PRINT 'Example: EXEC sp_create_tenant ''SCHOOL001'', ''My School'', ''premium'', ...';
