-- =====================================================
-- CORRECTED MASTER DATABASE SETUP (psctech_master)
-- TENANT MANAGEMENT SYSTEM - Compatible with C# Backend
-- =====================================================

-- Verify we're in the right database
SELECT 'Current Database:' as info, DB_NAME() as database_name;
GO

-- =====================================================
-- CREATE TENANT MANAGEMENT TABLES
-- =====================================================

-- Institutions Master Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[institutions]') AND type in (N'U'))
BEGIN
    CREATE TABLE institutions (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NOT NULL,
        code NVARCHAR(50) NOT NULL UNIQUE,
        type NVARCHAR(20) NOT NULL CHECK (type IN ('primary', 'secondary', 'combined')),
        district NVARCHAR(100),
        province NVARCHAR(100),
        country NVARCHAR(100) DEFAULT 'South Africa',
        address NVARCHAR(MAX),
        phone NVARCHAR(20),
        email NVARCHAR(255),
        website NVARCHAR(255),
        logo_url NVARCHAR(500),
        subscription_plan NVARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
        subscription_status NVARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'suspended')),
        subscription_expiry DATE,
        max_users INT DEFAULT 100,
        max_students INT DEFAULT 1000,
        database_name NVARCHAR(128) NOT NULL UNIQUE,
        server_name NVARCHAR(128) NOT NULL,
        connection_string NVARCHAR(MAX),
        is_active BIT DEFAULT 1,
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT 'Table "institutions" created successfully.';
END
ELSE
BEGIN
    PRINT 'Table "institutions" already exists.';
END
GO

-- Tenant Database Status
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tenant_databases]') AND type in (N'U'))
BEGIN
    CREATE TABLE tenant_databases (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        institution_id UNIQUEIDENTIFIER NOT NULL,
        database_name NVARCHAR(128) NOT NULL,
        server_name NVARCHAR(128) NOT NULL,
        status NVARCHAR(20) DEFAULT 'provisioning' CHECK (status IN ('provisioning', 'active', 'suspended', 'deleted', 'error')),
        service_tier NVARCHAR(20) DEFAULT 'Standard' CHECK (service_tier IN ('Basic', 'Standard', 'Premium', 'Business Critical')),
        dtus_vcores INT DEFAULT 20,
        storage_gb INT DEFAULT 20,
        current_size_gb DECIMAL(10,2),
        max_size_gb INT DEFAULT 250,
        last_backup DATETIME2(7),
        last_maintenance DATETIME2(7),
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT 'Table "tenant_databases" created successfully.';
END
ELSE
BEGIN
    PRINT 'Table "tenant_databases" already exists.';
END
GO

-- Tenant Provisioning Log
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tenant_provisioning_log]') AND type in (N'U'))
BEGIN
    CREATE TABLE tenant_provisioning_log (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        institution_id UNIQUEIDENTIFIER NOT NULL,
        action NVARCHAR(50) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'suspend', 'resume', 'backup', 'restore')),
        status NVARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'cancelled')),
        details NVARCHAR(MAX),
        error_message NVARCHAR(MAX),
        started_at DATETIME2(7) DEFAULT GETUTCDATE(),
        completed_at DATETIME2(7)
    );
    PRINT 'Table "tenant_provisioning_log" created successfully.';
END
ELSE
BEGIN
    PRINT 'Table "tenant_provisioning_log" already exists.';
END
GO

-- Add computed column for duration
IF NOT EXISTS (SELECT * FROM sys.computed_columns WHERE object_id = OBJECT_ID(N'[dbo].[tenant_provisioning_log]') AND name = 'duration_seconds')
BEGIN
    ALTER TABLE tenant_provisioning_log 
    ADD duration_seconds AS DATEDIFF(SECOND, started_at, completed_at);
    PRINT 'Computed column "duration_seconds" added successfully.';
END
GO

-- =====================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraints
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_tenant_databases_institution')
BEGIN
    ALTER TABLE tenant_databases 
    ADD CONSTRAINT FK_tenant_databases_institution 
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT 'Foreign key constraint "FK_tenant_databases_institution" added successfully.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_provisioning_log_institution')
BEGIN
    ALTER TABLE tenant_provisioning_log 
    ADD CONSTRAINT FK_provisioning_log_institution 
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT 'Foreign key constraint "FK_provisioning_log_institution" added successfully.';
END
GO

-- =====================================================
-- CREATE STORED PROCEDURES
-- =====================================================

-- Create New Institution Database
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateInstitutionDatabase]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CreateInstitutionDatabase]
GO

CREATE PROCEDURE sp_CreateInstitutionDatabase
    @InstitutionCode NVARCHAR(50),
    @InstitutionName NVARCHAR(255),
    @InstitutionType NVARCHAR(20),
    @ServiceTier NVARCHAR(20) = 'Standard',
    @DTUsVCores INT = 20,
    @StorageGB INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @InstitutionID UNIQUEIDENTIFIER;
    DECLARE @DatabaseName NVARCHAR(128);
    DECLARE @ServerName NVARCHAR(128);
    DECLARE @ProvisioningLogID UNIQUEIDENTIFIER;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Generate unique database name
        SET @DatabaseName = 'psc_tech_' + LOWER(REPLACE(@InstitutionCode, ' ', '_')) + '_' + 
                           FORMAT(GETUTCDATE(), 'yyyyMMdd_HHmmss');
        
        -- Get server name from configuration
        SET @ServerName = 'psctech-rg.database.windows.net';
        
        -- Insert institution record
        INSERT INTO institutions (name, code, type, database_name, server_name)
        VALUES (@InstitutionName, @InstitutionCode, @InstitutionType, @DatabaseName, @ServerName);
        
        -- Get the inserted ID
        SET @InstitutionID = (SELECT id FROM institutions WHERE code = @InstitutionCode);
        
        -- Insert tenant database record
        INSERT INTO tenant_databases (institution_id, database_name, server_name, service_tier, dtus_vcores, storage_gb)
        VALUES (@InstitutionID, @DatabaseName, @ServerName, @ServiceTier, @DTUsVCores, @StorageGB);
        
        -- Log provisioning start
        INSERT INTO tenant_provisioning_log (institution_id, action, status, details)
        VALUES (@InstitutionID, 'create', 'started', 
                'Creating database: ' + @DatabaseName + ' on server: ' + @ServerName);
        
        SET @ProvisioningLogID = (SELECT id FROM tenant_provisioning_log WHERE institution_id = @InstitutionID AND action = 'create' AND status = 'started');
        
        -- Update provisioning log to completed
        UPDATE tenant_provisioning_log 
        SET status = 'completed', completed_at = GETUTCDATE()
        WHERE id = @ProvisioningLogID;
        
        -- Update tenant database status
        UPDATE tenant_databases 
        SET status = 'active'
        WHERE institution_id = @InstitutionID;
        
        COMMIT TRANSACTION;
        
        -- Return success
        SELECT 
            'Success' as result,
            @InstitutionID as institution_id,
            @DatabaseName as database_name,
            @ServerName as server_name;
            
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- Log error
        IF @ProvisioningLogID IS NOT NULL
        BEGIN
            UPDATE tenant_provisioning_log 
            SET status = 'failed', 
                error_message = ERROR_MESSAGE(),
                completed_at = GETUTCDATE()
            WHERE id = @ProvisioningLogID;
        END
        
        -- Return error
        SELECT 
            'Error' as result,
            ERROR_MESSAGE() as error_message;
    END CATCH
END;
GO

PRINT 'Stored procedure "sp_CreateInstitutionDatabase" created successfully.';

-- Suspend Institution Database
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_SuspendInstitutionDatabase]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_SuspendInstitutionDatabase]
GO

CREATE PROCEDURE sp_SuspendInstitutionDatabase
    @InstitutionCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @InstitutionID UNIQUEIDENTIFIER;
    DECLARE @DatabaseName NVARCHAR(128);
    DECLARE @ProvisioningLogID UNIQUEIDENTIFIER;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Get institution details
        SELECT @InstitutionID = id, @DatabaseName = database_name
        FROM institutions 
        WHERE code = @InstitutionCode;
        
        IF @InstitutionID IS NULL
            THROW 50001, 'Institution not found', 1;
        
        -- Log suspension start
        INSERT INTO tenant_provisioning_log (institution_id, action, status, details)
        VALUES (@InstitutionID, 'suspend', 'started', 'Suspending database: ' + @DatabaseName);
        
        SET @ProvisioningLogID = (SELECT id FROM tenant_provisioning_log WHERE institution_id = @InstitutionID AND action = 'suspend' AND status = 'started');
        
        -- Update tenant database status
        UPDATE tenant_databases 
        SET status = 'suspended'
        WHERE institution_id = @InstitutionID;
        
        -- Update institution status
        UPDATE institutions 
        SET subscription_status = 'suspended'
        WHERE id = @InstitutionID;
        
        -- Update provisioning log to completed
        UPDATE tenant_provisioning_log 
        SET status = 'completed', completed_at = GETUTCDATE()
        WHERE id = @ProvisioningLogID;
        
        COMMIT TRANSACTION;
        
        SELECT 'Success' as result, 'Database suspended successfully' as message;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- Log error
        IF @ProvisioningLogID IS NOT NULL
        BEGIN
            UPDATE tenant_provisioning_log 
            SET status = 'failed', 
                error_message = ERROR_MESSAGE(),
                completed_at = GETUTCDATE()
            WHERE id = @ProvisioningLogID;
        END
        
        SELECT 'Error' as result, ERROR_MESSAGE() as error_message;
    END CATCH
END;
GO

PRINT 'Stored procedure "sp_SuspendInstitutionDatabase" created successfully.';

-- Resume Institution Database
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_ResumeInstitutionDatabase]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_ResumeInstitutionDatabase]
GO

CREATE PROCEDURE sp_ResumeInstitutionDatabase
    @InstitutionCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @InstitutionID UNIQUEIDENTIFIER;
    DECLARE @DatabaseName NVARCHAR(128);
    DECLARE @ProvisioningLogID UNIQUEIDENTIFIER;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Get institution details
        SELECT @InstitutionID = id, @DatabaseName = database_name
        FROM institutions 
        WHERE code = @InstitutionCode;
        
        IF @InstitutionID IS NULL
            THROW 50001, 'Institution not found', 1;
        
        -- Log resume start
        INSERT INTO tenant_provisioning_log (institution_id, action, status, details)
        VALUES (@InstitutionID, 'resume', 'started', 'Resuming database: ' + @DatabaseName);
        
        SET @ProvisioningLogID = (SELECT id FROM tenant_provisioning_log WHERE institution_id = @InstitutionID AND action = 'resume' AND status = 'started');
        
        -- Update tenant database status
        UPDATE tenant_databases 
        SET status = 'active'
        WHERE institution_id = @InstitutionID;
        
        -- Update institution status
        UPDATE institutions 
        SET subscription_status = 'active'
        WHERE id = @InstitutionID;
        
        -- Update provisioning log to completed
        UPDATE tenant_provisioning_log 
        SET status = 'completed', completed_at = GETUTCDATE()
        WHERE id = @ProvisioningLogID;
        
        COMMIT TRANSACTION;
        
        SELECT 'Success' as result, 'Database resumed successfully' as message;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- Log error
        IF @ProvisioningLogID IS NOT NULL
        BEGIN
            UPDATE tenant_provisioning_log 
            SET status = 'failed', 
                error_message = ERROR_MESSAGE(),
                completed_at = GETUTCDATE()
            WHERE id = @ProvisioningLogID;
        END
        
        SELECT 'Error' as result, ERROR_MESSAGE() as error_message;
    END CATCH
END;
GO

PRINT 'Stored procedure "sp_ResumeInstitutionDatabase" created successfully.';

-- Get Institution Connection String
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetInstitutionConnectionString]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetInstitutionConnectionString]
GO

CREATE PROCEDURE sp_GetInstitutionConnectionString
    @InstitutionCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        i.database_name,
        i.server_name,
        i.connection_string,
        td.status as database_status,
        td.service_tier,
        td.dtus_vcores,
        td.storage_gb
    FROM institutions i
    INNER JOIN tenant_databases td ON i.id = td.institution_id
    WHERE i.code = @InstitutionCode
    AND i.is_active = 1;
END;
GO

PRINT 'Stored procedure "sp_GetInstitutionConnectionString" created successfully.';

-- =====================================================
-- CREATE VIEWS
-- =====================================================

-- Tenant Overview
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_tenant_overview]'))
    DROP VIEW [dbo].[vw_tenant_overview]
GO

CREATE VIEW vw_tenant_overview AS
SELECT 
    i.code,
    i.name,
    i.type,
    i.subscription_plan,
    i.subscription_status,
    td.database_name,
    td.status as database_status,
    td.service_tier,
    td.dtus_vcores,
    td.storage_gb,
    td.current_size_gb,
    td.last_backup,
    i.created_at,
    i.updated_at
FROM institutions i
INNER JOIN tenant_databases td ON i.id = td.institution_id
WHERE i.is_active = 1;
GO

PRINT 'View "vw_tenant_overview" created successfully.';

-- Tenant Database Performance
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_tenant_performance]'))
    DROP VIEW [dbo].[vw_tenant_performance]
GO

CREATE VIEW vw_tenant_performance AS
SELECT 
    i.code,
    i.name,
    td.database_name,
    td.status,
    td.service_tier,
    td.dtus_vcores,
    td.storage_gb,
    td.current_size_gb,
    CAST((td.current_size_gb / td.storage_gb) * 100 AS DECIMAL(5,2)) as storage_usage_percent,
    td.last_backup,
    td.last_maintenance,
    DATEDIFF(DAY, td.last_maintenance, GETUTCDATE()) as days_since_maintenance
FROM institutions i
INNER JOIN tenant_databases td ON i.id = td.institution_id
WHERE i.is_active = 1;
GO

PRINT 'View "vw_tenant_performance" created successfully.';

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Create indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[institutions]') AND name = 'IX_institutions_code')
BEGIN
    CREATE NONCLUSTERED INDEX IX_institutions_code ON institutions(code) INCLUDE (name, is_active);
    PRINT 'Index "IX_institutions_code" created successfully.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[institutions]') AND name = 'IX_institutions_database')
BEGIN
    CREATE NONCLUSTERED INDEX IX_institutions_database ON institutions(database_name) INCLUDE (code, is_active);
    PRINT 'Index "IX_institutions_database" created successfully.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[tenant_databases]') AND name = 'IX_tenant_databases_status')
BEGIN
    CREATE NONCLUSTERED INDEX IX_tenant_databases_status ON tenant_databases(status) INCLUDE (institution_id, database_name);
    PRINT 'Index "IX_tenant_databases_status" created successfully.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[tenant_provisioning_log]') AND name = 'IX_provisioning_log_institution')
BEGIN
    CREATE NONCLUSTERED INDEX IX_provisioning_log_institution ON tenant_provisioning_log(institution_id) INCLUDE (action, status, started_at);
    PRINT 'Index "IX_provisioning_log_institution" created successfully.';
END
GO

-- =====================================================
-- INSERT INITIAL DATA
-- =====================================================

-- Insert sample institution (this will be used for testing)
IF NOT EXISTS (SELECT * FROM institutions WHERE code = 'MASTER001')
BEGIN
    INSERT INTO institutions (name, code, type, database_name, server_name)
    VALUES ('Master Institution', 'MASTER001', 'combined', 'psctech_main', 'psctech-rg.database.windows.net');
    PRINT 'Initial institution data inserted successfully.';
END
ELSE
BEGIN
    PRINT 'Initial institution data already exists.';
END
GO

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify the setup
SELECT 'Tables Created:' as info;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;
GO

SELECT 'Stored Procedures Created:' as info;
SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' ORDER BY ROUTINE_NAME;
GO

SELECT 'Views Created:' as info;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS ORDER BY TABLE_NAME;
GO

PRINT '========================================';
PRINT 'Master Database (psctech_master) setup completed successfully!';
PRINT 'Current Database: ' + DB_NAME();
PRINT 'Server: psctech-rg.database.windows.net';
PRINT '========================================';
