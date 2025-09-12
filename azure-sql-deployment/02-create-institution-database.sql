-- ========================================
-- PSC TECH INSTITUTION DATABASE SETUP
-- Azure SQL Database - Main Institution
-- ========================================

-- Create the main institution database
USE [master];
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'psctech_main')
BEGIN
    CREATE DATABASE [psctech_main];
END
GO

USE [psctech_main];
GO

-- Create schemas for organization
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'vouchers')
BEGIN
    EXEC('CREATE SCHEMA [vouchers]');
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'users')
BEGIN
    EXEC('CREATE SCHEMA [users]');
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'institutions')
BEGIN
    EXEC('CREATE SCHEMA [institutions]');
END
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'audit')
BEGIN
    EXEC('CREATE SCHEMA [audit]');
END
GO

-- ========================================
-- VOUCHER SYSTEM TABLES
-- ========================================

-- Main vouchers table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[vouchers].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [vouchers].[vouchers] (
        [id] VARCHAR(50) PRIMARY KEY,
        [code_hash] VARCHAR(64) NOT NULL, -- SHA-256 hash
        [code_salt] VARCHAR(32) NOT NULL, -- Random salt for security
        [visible_code] VARCHAR(8) NOT NULL, -- Short reference code for display
        [value] INT NOT NULL CHECK (value IN (5,10,15,20,25,30,35,40,45)), -- Fixed denominations
        [learner_count] INT NOT NULL CHECK (learner_count BETWEEN 1 AND 10), -- Number of learners (1-10)
        [parent_name] NVARCHAR(255) NOT NULL, -- Parent/Guardian name
        [notes] NVARCHAR(MAX) NULL, -- Additional notes
        [status] VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
        [institution_id] VARCHAR(50) NOT NULL,
        [issued_by_user_id] VARCHAR(50) NOT NULL,
        [redeemed_by_user_id] VARCHAR(50) NULL,
        [issued_date] DATETIME2(7) DEFAULT GETUTCDATE(),
        [redeemed_date] DATETIME2(7) NULL,
        [expiry_date] DATETIME2(7) NULL, -- 30 days after redemption
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [is_active] BIT DEFAULT 1,
        [redemption_attempts] INT DEFAULT 0,
        [max_redemption_attempts] INT DEFAULT 5
    );
END
GO

-- Voucher redemptions table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[vouchers].[voucher_redemptions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [vouchers].[voucher_redemptions] (
        [id] VARCHAR(50) PRIMARY KEY,
        [voucher_id] VARCHAR(50) NOT NULL,
        [user_id] VARCHAR(50) NOT NULL,
        [redemption_date] DATETIME2(7) DEFAULT GETUTCDATE(),
        [status] VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
        [redemption_method] VARCHAR(20) DEFAULT 'online' CHECK (redemption_method IN ('online', 'mobile', 'api', 'manual')),
        [ip_address] VARCHAR(45) NULL,
        [user_agent] NVARCHAR(500) NULL,
        [session_id] VARCHAR(100) NULL,
        [request_id] VARCHAR(100) NULL,
        [error_message] NVARCHAR(MAX) NULL,
        [completed_date] DATETIME2(7) NULL,
        [cancelled_date] DATETIME2(7) NULL,
        [last_attempt_date] DATETIME2(7) NULL,
        [attempt_count] INT DEFAULT 1,
        [max_attempts] INT DEFAULT 3,
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2(7) DEFAULT GETUTCDATE()
    );
END
GO

-- Voucher audit table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[vouchers].[voucher_audits]') AND type in (N'U'))
BEGIN
    CREATE TABLE [vouchers].[voucher_audits] (
        [id] VARCHAR(50) PRIMARY KEY,
        [voucher_id] VARCHAR(50) NOT NULL,
        [action] VARCHAR(100) NOT NULL,
        [severity] VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
        [source] VARCHAR(20) DEFAULT 'system' CHECK (source IN ('user', 'system', 'api', 'scheduled', 'admin')),
        [user_id] VARCHAR(50) NULL,
        [username] NVARCHAR(100) NULL,
        [description] NVARCHAR(MAX) NOT NULL,
        [metadata] NVARCHAR(MAX) NULL, -- JSON string
        [requires_review] BIT DEFAULT 0,
        [review_notes] NVARCHAR(MAX) NULL,
        [reviewed_by] VARCHAR(50) NULL,
        [reviewed_at] DATETIME2(7) NULL,
        [category] VARCHAR(50) NULL,
        [subcategory] VARCHAR(50) NULL,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE()
    );
END
GO

-- ========================================
-- USER MANAGEMENT TABLES
-- ========================================

-- Users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[users].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [users].[users] (
        [id] VARCHAR(50) PRIMARY KEY,
        [email] NVARCHAR(255) NOT NULL UNIQUE,
        [username] NVARCHAR(100) NULL UNIQUE,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [role] VARCHAR(20) NOT NULL CHECK (role IN ('Principal', 'Teacher', 'Parent', 'Learner', 'SGB')),
        [status] VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
        [password_hash] VARCHAR(255) NOT NULL,
        [password_salt] VARCHAR(100) NOT NULL,
        [email_verified] BIT DEFAULT 0,
        [phone_number] NVARCHAR(20) NULL,
        [profile_picture] NVARCHAR(500) NULL,
        [date_of_birth] DATE NULL,
        [gender] VARCHAR(10) NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
        [address] NVARCHAR(MAX) NULL,
        [emergency_contact] NVARCHAR(255) NULL,
        [emergency_phone] NVARCHAR(20) NULL,
        [last_login_at] DATETIME2(7) NULL,
        [login_count] INT DEFAULT 0,
        [failed_login_attempts] INT DEFAULT 0,
        [account_locked_until] DATETIME2(7) NULL,
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [deleted_at] DATETIME2(7) NULL
    );
END
GO

-- User profiles table for additional information
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[users].[user_profiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [users].[user_profiles] (
        [id] VARCHAR(50) PRIMARY KEY,
        [user_id] VARCHAR(50) NOT NULL,
        [bio] NVARCHAR(MAX) NULL,
        [interests] NVARCHAR(MAX) NULL, -- JSON string
        [skills] NVARCHAR(MAX) NULL, -- JSON string
        [education] NVARCHAR(MAX) NULL, -- JSON string
        [work_experience] NVARCHAR(MAX) NULL, -- JSON string
        [social_links] NVARCHAR(MAX) NULL, -- JSON string
        [preferences] NVARCHAR(MAX) NULL, -- JSON string
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2(7) DEFAULT GETUTCDATE()
    );
END
GO

-- ========================================
-- INSTITUTION TABLES
-- ========================================

-- Institution details table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[institutions].[institution_details]') AND type in (N'U'))
BEGIN
    CREATE TABLE [institutions].[institution_details] (
        [id] VARCHAR(50) PRIMARY KEY,
        [name] NVARCHAR(255) NOT NULL,
        [type] VARCHAR(50) NOT NULL CHECK (type IN ('primary', 'secondary', 'high_school', 'college', 'university', 'vocational')),
        [status] VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
        [address] NVARCHAR(MAX) NOT NULL,
        [city] NVARCHAR(100) NOT NULL,
        [province] NVARCHAR(100) NOT NULL,
        [postal_code] NVARCHAR(10) NULL,
        [country] NVARCHAR(100) DEFAULT 'South Africa',
        [phone] NVARCHAR(20) NULL,
        [email] NVARCHAR(255) NULL,
        [website] NVARCHAR(500) NULL,
        [logo_url] NVARCHAR(500) NULL,
        [banner_url] NVARCHAR(500) NULL,
        [description] NVARCHAR(MAX) NULL,
        [mission_statement] NVARCHAR(MAX) NULL,
        [vision_statement] NVARCHAR(MAX) NULL,
        [founded_year] INT NULL,
        [accreditation] NVARCHAR(MAX) NULL, -- JSON string
        [facilities] NVARCHAR(MAX) NULL, -- JSON string
        [curriculum] NVARCHAR(MAX) NULL, -- JSON string
        [max_capacity] INT NULL,
        [current_enrollment] INT DEFAULT 0,
        [timezone] NVARCHAR(50) DEFAULT 'Africa/Johannesburg',
        [locale] NVARCHAR(10) DEFAULT 'en-ZA',
        [created_at] DATETIME2(7) DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2(7) DEFAULT GETUTCDATE()
    );
END
GO

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Voucher indexes
CREATE INDEX IF NOT EXISTS [IX_vouchers_code_hash] ON [vouchers].[vouchers] ([code_hash]);
CREATE INDEX IF NOT EXISTS [IX_vouchers_visible_code] ON [vouchers].[vouchers] ([visible_code]);
CREATE INDEX IF NOT EXISTS [IX_vouchers_status] ON [vouchers].[vouchers] ([status]);
CREATE INDEX IF NOT EXISTS [IX_vouchers_institution_id] ON [vouchers].[vouchers] ([institution_id]);
CREATE INDEX IF NOT EXISTS [IX_vouchers_issued_by] ON [vouchers].[vouchers] ([issued_by_user_id]);
CREATE INDEX IF NOT EXISTS [IX_vouchers_issued_date] ON [vouchers].[vouchers] ([issued_date]);
CREATE INDEX IF NOT EXISTS [IX_vouchers_expiry_date] ON [vouchers].[vouchers] ([expiry_date]);
CREATE INDEX IF NOT EXISTS [IX_vouchers_parent_name] ON [vouchers].[vouchers] ([parent_name]);

-- Voucher redemption indexes
CREATE INDEX IF NOT EXISTS [IX_voucher_redemptions_voucher_id] ON [vouchers].[voucher_redemptions] ([voucher_id]);
CREATE INDEX IF NOT EXISTS [IX_voucher_redemptions_user_id] ON [vouchers].[voucher_redemptions] ([user_id]);
CREATE INDEX IF NOT EXISTS [IX_voucher_redemptions_status] ON [vouchers].[voucher_redemptions] ([status]);
CREATE INDEX IF NOT EXISTS [IX_voucher_redemptions_redemption_date] ON [vouchers].[voucher_redemptions] ([redemption_date]);

-- Voucher audit indexes
CREATE INDEX IF NOT EXISTS [IX_voucher_audits_voucher_id] ON [vouchers].[voucher_audits] ([voucher_id]);
CREATE INDEX IF NOT EXISTS [IX_voucher_audits_action] ON [vouchers].[voucher_audits] ([action]);
CREATE INDEX IF NOT EXISTS [IX_voucher_audits_severity] ON [vouchers].[voucher_audits] ([severity]);
CREATE INDEX IF NOT EXISTS [IX_voucher_audits_created_at] ON [vouchers].[voucher_audits] ([created_at]);
CREATE INDEX IF NOT EXISTS [IX_voucher_audits_user_id] ON [vouchers].[voucher_audits] ([user_id]);

-- User indexes
CREATE INDEX IF NOT EXISTS [IX_users_email] ON [users].[users] ([email]);
CREATE INDEX IF NOT EXISTS [IX_users_username] ON [users].[users] ([username]);
CREATE INDEX IF NOT EXISTS [IX_users_role] ON [users].[users] ([role]);
CREATE INDEX IF NOT EXISTS [IX_users_status] ON [users].[users] ([status]);
CREATE INDEX IF NOT EXISTS [IX_users_created_at] ON [users].[users] ([created_at]);

-- Institution indexes
CREATE INDEX IF NOT EXISTS [IX_institution_details_name] ON [institutions].[institution_details] ([name]);
CREATE INDEX IF NOT EXISTS [IX_institution_details_type] ON [institutions].[institution_details] ([type]);
CREATE INDEX IF NOT EXISTS [IX_institution_details_status] ON [institutions].[institution_details] ([status]);
CREATE INDEX IF NOT EXISTS [IX_institution_details_city] ON [institutions].[institution_details] ([city]);

-- ========================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ========================================

-- Voucher foreign keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[vouchers].[FK_vouchers_issued_by]') AND parent_object_id = OBJECT_ID(N'[vouchers].[vouchers]'))
BEGIN
    ALTER TABLE [vouchers].[vouchers] 
    ADD CONSTRAINT [FK_vouchers_issued_by] 
    FOREIGN KEY ([issued_by_user_id]) REFERENCES [users].[users] ([id]);
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[vouchers].[FK_vouchers_redeemed_by]') AND parent_object_id = OBJECT_ID(N'[vouchers].[vouchers]'))
BEGIN
    ALTER TABLE [vouchers].[vouchers] 
    ADD CONSTRAINT [FK_vouchers_redeemed_by] 
    FOREIGN KEY ([redeemed_by_user_id]) REFERENCES [users].[users] ([id]);
END

-- Voucher redemption foreign keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[vouchers].[FK_voucher_redemptions_voucher]') AND parent_object_id = OBJECT_ID(N'[vouchers].[voucher_redemptions]'))
BEGIN
    ALTER TABLE [vouchers].[voucher_redemptions] 
    ADD CONSTRAINT [FK_voucher_redemptions_voucher] 
    FOREIGN KEY ([voucher_id]) REFERENCES [vouchers].[vouchers] ([id]) ON DELETE CASCADE;
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[vouchers].[FK_voucher_redemptions_user]') AND parent_object_id = OBJECT_ID(N'[vouchers].[voucher_redemptions]'))
BEGIN
    ALTER TABLE [vouchers].[voucher_redemptions] 
    ADD CONSTRAINT [FK_voucher_redemptions_user] 
    FOREIGN KEY ([user_id]) REFERENCES [users].[users] ([id]);
END

-- Voucher audit foreign keys
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[vouchers].[FK_voucher_audits_voucher]') AND parent_object_id = OBJECT_ID(N'[vouchers].[voucher_audits]'))
BEGIN
    ALTER TABLE [vouchers].[voucher_audits] 
    ADD CONSTRAINT [FK_voucher_audits_voucher] 
    FOREIGN KEY ([voucher_id]) REFERENCES [vouchers].[vouchers] ([id]) ON DELETE CASCADE;
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[vouchers].[FK_voucher_audits_user]') AND parent_object_id = OBJECT_ID(N'[vouchers].[voucher_audits]'))
BEGIN
    ALTER TABLE [vouchers].[voucher_audits] 
    ADD CONSTRAINT [FK_voucher_audits_user] 
    FOREIGN KEY ([user_id]) REFERENCES [users].[users] ([id]);
END

-- User profile foreign key
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[users].[FK_user_profiles_user]') AND parent_object_id = OBJECT_ID(N'[users].[user_profiles]'))
BEGIN
    ALTER TABLE [users].[user_profiles] 
    ADD CONSTRAINT [FK_user_profiles_user] 
    FOREIGN KEY ([user_id]) REFERENCES [users].[users] ([id]) ON DELETE CASCADE;
END

-- ========================================
-- INSERT DEFAULT DATA
-- ========================================

-- Insert default institution
IF NOT EXISTS (SELECT * FROM [institutions].[institution_details] WHERE name = 'PSC Tech')
BEGIN
    INSERT INTO [institutions].[institution_details] (
        [id], [name], [type], [address], [city], [province], [phone], [email], [website]
    ) VALUES (
        'psctech-001', 
        'PSC Tech', 
        'high_school', 
        '123 Education Street, Tech District', 
        'Johannesburg', 
        'Gauteng', 
        '+27 11 123 4567', 
        'info@psctech.com', 
        'https://psctech.com'
    );
END

-- Insert default principal user
IF NOT EXISTS (SELECT * FROM [users].[users] WHERE email = 'principal@psctech.com')
BEGIN
    INSERT INTO [users].[users] (
        [id], [email], [username], [first_name], [last_name], [role], [password_hash], [password_salt]
    ) VALUES (
        'user-001', 
        'principal@psctech.com', 
        'principal', 
        'John', 
        'Principal', 
        'Principal', 
        'hashed_password_here', 
        'salt_here'
    );
END

-- Insert default parent user
IF NOT EXISTS (SELECT * FROM [users].[users] WHERE email = 'parent@psctech.com')
BEGIN
    INSERT INTO [users].[users] (
        [id], [email], [username], [first_name], [last_name], [role], [password_hash], [password_salt]
    ) VALUES (
        'user-002', 
        'parent@psctech.com', 
        'parent', 
        'Sarah', 
        'Parent', 
        'Parent', 
        'hashed_password_here', 
        'salt_here'
    );
END

PRINT 'Institution database setup completed successfully!';
GO


