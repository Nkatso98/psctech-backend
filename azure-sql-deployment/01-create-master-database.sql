-- ========================================
-- PSC TECH MASTER DATABASE SETUP
-- Azure SQL Database
-- ========================================

-- Create master database for tenant management
USE [master];
GO

-- Create the master database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'psctech_master')
BEGIN
    CREATE DATABASE [psctech_master];
END
GO

USE [psctech_master];
GO

-- Create schema for tenant management
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'tenant_management')
BEGIN
    EXEC('CREATE SCHEMA [tenant_management]');
END
GO

-- Create institutions table (master table)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[tenant_management].[institutions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [tenant_management].[institutions] (
        [id] VARCHAR(50) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [database_name] VARCHAR(128) NOT NULL UNIQUE,
        [connection_string] NVARCHAR(MAX) NOT NULL,
        [status] VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
        [subscription_tier] VARCHAR(20) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
        [max_users] INT DEFAULT 100,
        [max_students] INT DEFAULT 1000,
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [activated_at] DATETIME2(7) NULL,
        [expires_at] DATETIME2(7) NULL,
        [contact_email] NVARCHAR(255) NULL,
        [contact_phone] NVARCHAR(50) NULL,
        [address] NVARCHAR(MAX) NULL,
        [timezone] NVARCHAR(50) DEFAULT 'Africa/Johannesburg',
        [locale] NVARCHAR(10) DEFAULT 'en-ZA'
    );
END
GO

-- Create users table (master table for cross-tenant users)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[tenant_management].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [tenant_management].[users] (
        [id] VARCHAR(50) PRIMARY KEY,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [username] NVARCHAR(100) NULL UNIQUE,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [role] VARCHAR(20) NOT NULL CHECK (role IN ('Superadmin', 'Principal', 'Teacher', 'Parent', 'Learner', 'SGB')),
        [status] VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [last_login_at] DATETIME2(7) NULL,
        [is_superadmin] BIT DEFAULT 0,
        [can_access_multiple_institutions] BIT DEFAULT 0
    );
END
GO

-- Create user_institutions table (many-to-many relationship)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[tenant_management].[user_institutions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [tenant_management].[user_institutions] (
        [id] VARCHAR(50) PRIMARY KEY,
        [user_id] VARCHAR(50) NOT NULL,
        [institution_id] VARCHAR(50) NOT NULL,
        [role_in_institution] VARCHAR(20) NOT NULL CHECK (role_in_institution IN ('Principal', 'Teacher', 'Parent', 'Learner', 'SGB')),
        [status] VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        [joined_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [left_at] DATETIME2(7) NULL,
        [permissions] NVARCHAR(MAX) NULL, -- JSON string for role-specific permissions
        UNIQUE([user_id], [institution_id], [role_in_institution])
    );
END
GO

-- Create database_connections table for managing institution database connections
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[tenant_management].[database_connections]') AND type in (N'U'))
BEGIN
    CREATE TABLE [tenant_management].[database_connections] (
        [id] VARCHAR(50) PRIMARY KEY,
        [institution_id] VARCHAR(50) NOT NULL,
        [database_name] VARCHAR(128) NOT NULL UNIQUE,
        [connection_string] NVARCHAR(MAX) NOT NULL,
        [status] VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'error')),
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [last_health_check] DATETIME2(7) NULL,
        [health_status] VARCHAR(20) DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'warning', 'error', 'unknown')),
        [error_message] NVARCHAR(MAX) NULL,
        [maintenance_mode] BIT DEFAULT 0,
        [backup_frequency] VARCHAR(20) DEFAULT 'daily',
        [last_backup] DATETIME2(7) NULL
    );
END
GO

-- Create audit_log table for tenant management operations
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[tenant_management].[audit_log]') AND type in (N'U'))
BEGIN
    CREATE TABLE [tenant_management].[audit_log] (
        [id] VARCHAR(50) PRIMARY KEY,
        [action] VARCHAR(100) NOT NULL,
        [entity_type] VARCHAR(50) NOT NULL,
        [entity_id] VARCHAR(50) NULL,
        [user_id] VARCHAR(50) NULL,
        [institution_id] VARCHAR(50) NULL,
        [details] NVARCHAR(MAX) NULL, -- JSON string for additional details
        [ip_address] VARCHAR(45) NULL,
        [user_agent] NVARCHAR(500) NULL,
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [severity] VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical'))
    );
END
GO

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS [IX_institutions_database_name] ON [tenant_management].[institutions] ([database_name]);
CREATE INDEX IF NOT EXISTS [IX_institutions_status] ON [tenant_management].[institutions] ([status]);
CREATE INDEX IF NOT EXISTS [IX_users_email] ON [tenant_management].[users] ([email]);
CREATE INDEX IF NOT EXISTS [IX_users_role] ON [tenant_management].[users] ([role]);
CREATE INDEX IF NOT EXISTS [IX_user_institutions_user_id] ON [tenant_management].[user_institutions] ([user_id]);
CREATE INDEX IF NOT EXISTS [IX_user_institutions_institution_id] ON [tenant_management].[user_institutions] ([institution_id]);
CREATE INDEX IF NOT EXISTS [IX_database_connections_institution_id] ON [tenant_management].[database_connections] ([institution_id]);
CREATE INDEX IF NOT EXISTS [IX_database_connections_status] ON [tenant_management].[database_connections] ([status]);
CREATE INDEX IF NOT EXISTS [IX_audit_log_created_at] ON [tenant_management].[audit_log] ([created_at]);
CREATE INDEX IF NOT EXISTS [IX_audit_log_action] ON [tenant_management].[audit_log] ([action]);

-- Add foreign key constraints
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[tenant_management].[FK_user_institutions_user_id]') AND parent_object_id = OBJECT_ID(N'[tenant_management].[user_institutions]'))
BEGIN
    ALTER TABLE [tenant_management].[user_institutions] 
    ADD CONSTRAINT [FK_user_institutions_user_id] 
    FOREIGN KEY ([user_id]) REFERENCES [tenant_management].[users] ([id]) ON DELETE CASCADE;
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[tenant_management].[FK_user_institutions_institution_id]') AND parent_object_id = OBJECT_ID(N'[tenant_management].[user_institutions]'))
BEGIN
    ALTER TABLE [tenant_management].[user_institutions] 
    ADD CONSTRAINT [FK_user_institutions_institution_id] 
    FOREIGN KEY ([institution_id]) REFERENCES [tenant_management].[institutions] ([id]) ON DELETE CASCADE;
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[tenant_management].[FK_database_connections_institution_id]') AND parent_object_id = OBJECT_ID(N'[tenant_management].[database_connections]'))
BEGIN
    ALTER TABLE [tenant_management].[database_connections] 
    ADD CONSTRAINT [FK_database_connections_institution_id] 
    FOREIGN KEY ([institution_id]) REFERENCES [tenant_management].[institutions] ([id]) ON DELETE CASCADE;
END

-- Insert default superadmin user
IF NOT EXISTS (SELECT * FROM [tenant_management].[users] WHERE email = 'admin@psctech.com')
BEGIN
    INSERT INTO [tenant_management].[users] (
        [id], [email], [username], [first_name], [last_name], [role], [is_superadmin], [can_access_multiple_institutions]
    ) VALUES (
        'superadmin-001', 'admin@psctech.com', 'superadmin', 'System', 'Administrator', 'Superadmin', 1, 1
    );
END

-- Insert default institution (PSC Tech)
IF NOT EXISTS (SELECT * FROM [tenant_management].[institutions] WHERE name = 'PSC Tech')
BEGIN
    INSERT INTO [tenant_management].[institutions] (
        [id], [name], [database_name], [connection_string], [subscription_tier], [max_users], [max_students], [contact_email]
    ) VALUES (
        'psctech-001', 
        'PSC Tech', 
        'psctech_main', 
        'Server=psctech-rg.database.windows.net;Database=psctech_main;User Id=psctechadmin;Password=Rluthando@12;Encrypt=true;TrustServerCertificate=false;',
        'enterprise', 
        1000, 
        10000, 
        'admin@psctech.com'
    );
END

-- Insert default database connection
IF NOT EXISTS (SELECT * FROM [tenant_management].[database_connections] WHERE database_name = 'psctech_main')
BEGIN
    INSERT INTO [tenant_management].[database_connections] (
        [id], [institution_id], [database_name], [connection_string], [backup_frequency]
    ) VALUES (
        'db-conn-001', 
        'psctech-001', 
        'psctech_main', 
        'Server=psctech-rg.database.windows.net;Database=psctech_main;User Id=psctechadmin;Password=Rluthando@12;Encrypt=true;TrustServerCertificate=false;',
        'daily'
    );
END

PRINT 'Master database setup completed successfully!';
GO


