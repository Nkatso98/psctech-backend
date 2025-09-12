-- AWS Tenant Database Core Schema for PSCTECH (SQL Server Version)
-- Essential tables for multi-tenant institution management

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Institutions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[institutions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[institutions] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [code] NVARCHAR(20) UNIQUE NOT NULL,
        [name] NVARCHAR(255) NOT NULL,
        [type] NVARCHAR(50) NOT NULL,
        [email] NVARCHAR(255),
        [phone] NVARCHAR(20),
        [address] NVARCHAR(MAX),
        [subscription_plan] NVARCHAR(20) DEFAULT 'basic',
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- Users
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [username] NVARCHAR(100) UNIQUE NOT NULL,
        [email] NVARCHAR(255) UNIQUE NOT NULL,
        [password_hash] NVARCHAR(255) NOT NULL,
        [role] NVARCHAR(20) NOT NULL,
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_users_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id])
    );
END
GO

-- User Profiles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_profiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[user_profiles] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [user_id] UNIQUEIDENTIFIER NOT NULL,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [phone] NVARCHAR(20),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_user_profiles_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE
    );
END
GO

-- Students
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[students]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[students] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [student_number] NVARCHAR(50) UNIQUE NOT NULL,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [grade] NVARCHAR(10) NOT NULL,
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [parent_id] UNIQUEIDENTIFIER,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_students_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id]),
        CONSTRAINT [FK_students_users] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Teachers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[teachers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[teachers] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [employee_number] NVARCHAR(50) UNIQUE NOT NULL,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [email] NVARCHAR(255),
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [user_id] UNIQUEIDENTIFIER,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_teachers_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id]),
        CONSTRAINT [FK_teachers_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Study Results
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[study_results]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[study_results] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [user_id] UNIQUEIDENTIFIER NOT NULL,
        [total_questions] INT NOT NULL,
        [correct_answers] INT NOT NULL,
        [score] DECIMAL(5,2) NOT NULL,
        [time_spent] INT,
        [answers] NVARCHAR(MAX),
        [recommendations] NVARCHAR(MAX),
        [weak_areas] NVARCHAR(MAX),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_study_results_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Vouchers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vouchers] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [voucher_code] NVARCHAR(19) UNIQUE NOT NULL,
        [denomination] DECIMAL(10,2) NOT NULL,
        [parent_guardian_name] NVARCHAR(255) NOT NULL,
        [learner_count] INT NOT NULL,
        [status] NVARCHAR(20) NOT NULL DEFAULT 'active',
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [issued_by_user_id] UNIQUEIDENTIFIER NOT NULL,
        [issued_date] DATETIME2 DEFAULT GETUTCDATE(),
        [redeemed_by_user_id] UNIQUEIDENTIFIER,
        [redeemed_date] DATETIME2,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_vouchers_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id]),
        CONSTRAINT [FK_vouchers_users_issued] FOREIGN KEY ([issued_by_user_id]) REFERENCES [dbo].[users]([id]),
        CONSTRAINT [FK_vouchers_users_redeemed] FOREIGN KEY ([redeemed_by_user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Voucher Redemptions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[voucher_redemptions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[voucher_redemptions] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [voucher_id] UNIQUEIDENTIFIER NOT NULL,
        [user_id] UNIQUEIDENTIFIER NOT NULL,
        [redemption_date] DATETIME2 DEFAULT GETUTCDATE(),
        [learner_count] INT NOT NULL,
        [parent_guardian_name] NVARCHAR(255) NOT NULL,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_voucher_redemptions_vouchers] FOREIGN KEY ([voucher_id]) REFERENCES [dbo].[vouchers]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_voucher_redemptions_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Voucher Audit
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[voucher_audits]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[voucher_audits] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [voucher_id] UNIQUEIDENTIFIER NOT NULL,
        [action] NVARCHAR(50) NOT NULL,
        [user_id] UNIQUEIDENTIFIER,
        [details] NVARCHAR(MAX),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_voucher_audits_vouchers] FOREIGN KEY ([voucher_id]) REFERENCES [dbo].[vouchers]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_voucher_audits_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- =====================================================
-- INDEXES
-- =====================================================

-- Users Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_institution')
    CREATE INDEX [idx_users_institution] ON [dbo].[users]([institution_id]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_role')
    CREATE INDEX [idx_users_role] ON [dbo].[users]([role]);

-- Students Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_students_institution')
    CREATE INDEX [idx_students_institution] ON [dbo].[students]([institution_id]);

-- Voucher Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_vouchers_code')
    CREATE INDEX [idx_vouchers_code] ON [dbo].[vouchers]([voucher_code]);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample Institution
IF NOT EXISTS (SELECT * FROM [dbo].[institutions] WHERE [code] = 'DEMO001')
BEGIN
    INSERT INTO [dbo].[institutions] ([code], [name], [type], [email]) VALUES
    ('DEMO001', 'Demo School', 'Primary School', 'info@demoschool.com');
END

-- Sample Users
IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [username] = 'principal')
BEGIN
    INSERT INTO [dbo].[users] ([username], [email], [password_hash], [role], [institution_id]) VALUES
    ('principal', 'principal@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Principal', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
END

IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [username] = 'teacher')
BEGIN
    INSERT INTO [dbo].[users] ([username], [email], [password_hash], [role], [institution_id]) VALUES
    ('teacher', 'teacher@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Teacher', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
END

IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [username] = 'parent')
BEGIN
    INSERT INTO [dbo].[users] ([username], [email], [password_hash], [role], [institution_id]) VALUES
    ('parent', 'parent@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Parent', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
END

IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [username] = 'learner')
BEGIN
    INSERT INTO [dbo].[users] ([username], [email], [password_hash], [role], [institution_id]) VALUES
    ('learner', 'learner@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Learner', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
END

PRINT 'Core tenant database schema created successfully!';
