-- AWS Multi-Tenant Master Database Schema for PSCTECH (SQL Server Version)
-- This database manages tenant isolation and routing
-- Run this on AWS RDS SQL Server

-- =====================================================
-- MASTER DATABASE SCHEMA
-- =====================================================

-- Create master database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'psctech_master')
BEGIN
    CREATE DATABASE psctech_master;
END
GO

USE psctech_master;
GO

-- =====================================================
-- TENANT MANAGEMENT TABLES
-- =====================================================

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
END
GO

-- Tenant Database Connections - For connection pooling
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tenant_connections]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[tenant_connections] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [tenant_code] NVARCHAR(20) NOT NULL,
        [database_name] NVARCHAR(128) NOT NULL,
        [connection_pool_size] INT DEFAULT 10,
        [max_connections] INT DEFAULT 100,
        [current_connections] INT DEFAULT 0,
        [last_connection_time] DATETIME2,
        [is_healthy] BIT DEFAULT 1,
        [health_check_interval] INT DEFAULT 300, -- seconds
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_tenant_connections_tenant_registry] FOREIGN KEY ([tenant_code]) REFERENCES [dbo].[tenant_registry]([tenant_code])
    );
END
GO

-- Tenant Usage Analytics
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tenant_usage]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[tenant_usage] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [tenant_code] NVARCHAR(20) NOT NULL,
        [date] DATE NOT NULL,
        [active_users] INT DEFAULT 0,
        [total_requests] INT DEFAULT 0,
        [storage_used_gb] DECIMAL(10,2) DEFAULT 0,
        [api_calls] INT DEFAULT 0,
        [voucher_generated] INT DEFAULT 0,
        [study_sessions] INT DEFAULT 0,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_tenant_usage_tenant_registry] FOREIGN KEY ([tenant_code]) REFERENCES [dbo].[tenant_registry]([tenant_code]),
        CONSTRAINT [UQ_tenant_usage] UNIQUE([tenant_code], [date])
    );
END
GO

-- =====================================================
-- SUPER ADMIN TABLES
-- =====================================================

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
END
GO

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
END
GO

-- =====================================================
-- SUBSCRIPTION MANAGEMENT
-- =====================================================

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
END
GO

-- Tenant Subscriptions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tenant_subscriptions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[tenant_subscriptions] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [tenant_code] NVARCHAR(20) NOT NULL,
        [plan_code] NVARCHAR(50) NOT NULL,
        [status] NVARCHAR(20) NOT NULL DEFAULT 'active',
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [billing_cycle] NVARCHAR(20) NOT NULL DEFAULT 'monthly',
        [amount] DECIMAL(10,2) NOT NULL,
        [currency] NVARCHAR(3) DEFAULT 'USD',
        [payment_method] NVARCHAR(50),
        [auto_renew] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_tenant_subscriptions_tenant_registry] FOREIGN KEY ([tenant_code]) REFERENCES [dbo].[tenant_registry]([tenant_code]),
        CONSTRAINT [FK_tenant_subscriptions_subscription_plans] FOREIGN KEY ([plan_code]) REFERENCES [dbo].[subscription_plans]([plan_code])
    );
END
GO

-- =====================================================
-- AUDIT AND LOGGING
-- =====================================================

-- System Audit Log
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[system_audit_log]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[system_audit_log] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [tenant_code] NVARCHAR(20),
        [user_id] UNIQUEIDENTIFIER,
        [action] NVARCHAR(100) NOT NULL,
        [resource_type] NVARCHAR(50),
        [resource_id] NVARCHAR(100),
        [details] NVARCHAR(MAX), -- JSON data
        [ip_address] NVARCHAR(45),
        [user_agent] NVARCHAR(MAX),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_system_audit_log_tenant_registry] FOREIGN KEY ([tenant_code]) REFERENCES [dbo].[tenant_registry]([tenant_code])
    );
END
GO

-- API Usage Log
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[api_usage_log]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[api_usage_log] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [tenant_code] NVARCHAR(20),
        [endpoint] NVARCHAR(255) NOT NULL,
        [method] NVARCHAR(10) NOT NULL,
        [response_time_ms] INT,
        [status_code] INT,
        [user_id] UNIQUEIDENTIFIER,
        [ip_address] NVARCHAR(45),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_api_usage_log_tenant_registry] FOREIGN KEY ([tenant_code]) REFERENCES [dbo].[tenant_registry]([tenant_code])
    );
END
GO

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Tenant Registry Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tenant_registry_code')
    CREATE INDEX [idx_tenant_registry_code] ON [dbo].[tenant_registry]([tenant_code]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tenant_registry_database')
    CREATE INDEX [idx_tenant_registry_database] ON [dbo].[tenant_registry]([database_name]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tenant_registry_status')
    CREATE INDEX [idx_tenant_registry_status] ON [dbo].[tenant_registry]([subscription_status]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tenant_registry_active')
    CREATE INDEX [idx_tenant_registry_active] ON [dbo].[tenant_registry]([is_active]);

-- Usage Analytics Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tenant_usage_date')
    CREATE INDEX [idx_tenant_usage_date] ON [dbo].[tenant_usage]([date]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_tenant_usage_tenant')
    CREATE INDEX [idx_tenant_usage_tenant] ON [dbo].[tenant_usage]([tenant_code]);

-- Audit Log Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_log_tenant')
    CREATE INDEX [idx_audit_log_tenant] ON [dbo].[system_audit_log]([tenant_code]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_log_action')
    CREATE INDEX [idx_audit_log_action] ON [dbo].[system_audit_log]([action]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_audit_log_created')
    CREATE INDEX [idx_audit_log_created] ON [dbo].[system_audit_log]([created_at]);

-- API Usage Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_api_usage_tenant')
    CREATE INDEX [idx_api_usage_tenant] ON [dbo].[api_usage_log]([tenant_code]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_api_usage_endpoint')
    CREATE INDEX [idx_api_usage_endpoint] ON [dbo].[api_usage_log]([endpoint]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_api_usage_created')
    CREATE INDEX [idx_api_usage_created] ON [dbo].[api_usage_log]([created_at]);

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Create new tenant
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[create_tenant]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[create_tenant]
GO

CREATE PROCEDURE [dbo].[create_tenant]
    @p_tenant_code NVARCHAR(20),
    @p_tenant_name NVARCHAR(255),
    @p_database_name NVARCHAR(128),
    @p_server_endpoint NVARCHAR(255),
    @p_connection_string NVARCHAR(MAX),
    @p_subscription_plan NVARCHAR(50) = 'basic',
    @p_created_by UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @v_tenant_id UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO [dbo].[tenant_registry] (
        [id], [tenant_code], [tenant_name], [database_name], [server_endpoint], 
        [connection_string], [subscription_plan], [created_by]
    ) VALUES (
        @v_tenant_id, @p_tenant_code, @p_tenant_name, @p_database_name, @p_server_endpoint,
        @p_connection_string, @p_subscription_plan, @p_created_by
    );
    
    -- Log the creation
    INSERT INTO [dbo].[system_audit_log] ([tenant_code], [user_id], [action], [resource_type], [resource_id])
    VALUES (@p_tenant_code, @p_created_by, 'TENANT_CREATED', 'tenant', @p_tenant_code);
    
    SELECT @v_tenant_id AS tenant_id;
END
GO

-- Get tenant connection info
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

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default subscription plans
IF NOT EXISTS (SELECT * FROM [dbo].[subscription_plans] WHERE [plan_code] = 'basic')
BEGIN
    INSERT INTO [dbo].[subscription_plans] ([plan_code], [plan_name], [description], [price_monthly], [price_yearly], [max_users], [max_students], [max_storage_gb], [max_vouchers_per_month], [features]) VALUES
    ('basic', 'Basic Plan', 'Essential features for small institutions', 99.99, 999.99, 100, 500, 10, 1000, '["Basic voucher system", "Standard support", "Email notifications", "Basic analytics"]');
END

IF NOT EXISTS (SELECT * FROM [dbo].[subscription_plans] WHERE [plan_code] = 'premium')
BEGIN
    INSERT INTO [dbo].[subscription_plans] ([plan_code], [plan_name], [description], [price_monthly], [price_yearly], [max_users], [max_students], [max_storage_gb], [max_vouchers_per_month], [features]) VALUES
    ('premium', 'Premium Plan', 'Advanced features for growing institutions', 199.99, 1999.99, 500, 2000, 50, 5000, '["Advanced voucher system", "Priority support", "SMS notifications", "Advanced analytics", "Custom branding", "API access"]');
END

IF NOT EXISTS (SELECT * FROM [dbo].[subscription_plans] WHERE [plan_code] = 'enterprise')
BEGIN
    INSERT INTO [dbo].[subscription_plans] ([plan_code], [plan_name], [description], [price_monthly], [price_yearly], [max_users], [max_students], [max_storage_gb], [max_vouchers_per_month], [features]) VALUES
    ('enterprise', 'Enterprise Plan', 'Full-featured solution for large institutions', 399.99, 3999.99, 2000, 10000, 200, 20000, '["Full voucher system", "24/7 support", "Custom integrations", "Advanced analytics", "Custom branding", "API access", "White-label options", "Dedicated support"]');
END

-- Insert default super admin
IF NOT EXISTS (SELECT * FROM [dbo].[super_admin_users] WHERE [username] = 'superadmin')
BEGIN
    INSERT INTO [dbo].[super_admin_users] ([username], [email], [password_hash], [first_name], [last_name], [role]) VALUES
    ('superadmin', 'admin@psctech.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Super', 'Administrator', 'superadmin');
END

-- Insert system configuration
IF NOT EXISTS (SELECT * FROM [dbo].[system_config] WHERE [config_key] = 'default_subscription_plan')
BEGIN
    INSERT INTO [dbo].[system_config] ([config_key], [config_value], [config_type], [description]) VALUES
    ('default_subscription_plan', 'basic', 'string', 'Default subscription plan for new tenants');
END

IF NOT EXISTS (SELECT * FROM [dbo].[system_config] WHERE [config_key] = 'max_tenants_per_server')
BEGIN
    INSERT INTO [dbo].[system_config] ([config_key], [config_value], [config_type], [description]) VALUES
    ('max_tenants_per_server', '100', 'integer', 'Maximum number of tenants per database server');
END

IF NOT EXISTS (SELECT * FROM [dbo].[system_config] WHERE [config_key] = 'health_check_interval')
BEGIN
    INSERT INTO [dbo].[system_config] ([config_key], [config_value], [config_type], [description]) VALUES
    ('health_check_interval', '300', 'integer', 'Health check interval in seconds');
END

IF NOT EXISTS (SELECT * FROM [dbo].[system_config] WHERE [config_key] = 'backup_retention_days')
BEGIN
    INSERT INTO [dbo].[system_config] ([config_key], [config_value], [config_type], [description]) VALUES
    ('backup_retention_days', '30', 'integer', 'Number of days to retain backups');
END

IF NOT EXISTS (SELECT * FROM [dbo].[system_config] WHERE [config_key] = 'api_rate_limit')
BEGIN
    INSERT INTO [dbo].[system_config] ([config_key], [config_value], [config_type], [description]) VALUES
    ('api_rate_limit', '1000', 'integer', 'API rate limit per minute per tenant');
END

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Tenant Overview View
IF EXISTS (SELECT * FROM sys.views WHERE name = 'tenant_overview')
    DROP VIEW [dbo].[tenant_overview]
GO

CREATE VIEW [dbo].[tenant_overview] AS
SELECT 
    tr.[tenant_code],
    tr.[tenant_name],
    tr.[subscription_plan],
    tr.[subscription_status],
    tr.[subscription_expiry],
    tr.[is_active],
    tu.[active_users],
    tu.[total_requests],
    tu.[storage_used_gb],
    tr.[created_at]
FROM [dbo].[tenant_registry] tr
LEFT JOIN (
    SELECT [tenant_code], 
           SUM([active_users]) as [active_users],
           SUM([total_requests]) as [total_requests],
           MAX([storage_used_gb]) as [storage_used_gb]
    FROM [dbo].[tenant_usage] 
    WHERE [date] >= DATEADD(day, -30, GETDATE())
    GROUP BY [tenant_code]
) tu ON tr.[tenant_code] = tu.[tenant_code];
GO

-- System Health View
IF EXISTS (SELECT * FROM sys.views WHERE name = 'system_health')
    DROP VIEW [dbo].[system_health]
GO

CREATE VIEW [dbo].[system_health] AS
SELECT 
    tr.[tenant_code],
    tr.[is_active],
    tc.[is_healthy],
    tc.[current_connections],
    tc.[max_connections],
    tr.[subscription_status],
    tr.[subscription_expiry]
FROM [dbo].[tenant_registry] tr
LEFT JOIN [dbo].[tenant_connections] tc ON tr.[tenant_code] = tc.[tenant_code];
GO

PRINT 'Master database schema created successfully!';
