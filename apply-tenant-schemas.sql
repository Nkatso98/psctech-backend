-- Apply PSCTECH Tenant Database Schemas
-- This script applies the core and extended schemas to tenant databases

-- =====================================================
-- APPLY TO SAMPLE TENANT DATABASE
-- =====================================================

PRINT 'Applying schemas to sample tenant database...';

USE psctech_tenant_DEMO001;
GO

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
    PRINT '✓ institutions table created';
END

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
    PRINT '✓ users table created';
END

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
    PRINT '✓ user_profiles table created';
END

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
    PRINT '✓ students table created';
END

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
    PRINT '✓ teachers table created';
END

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
    PRINT '✓ study_results table created';
END

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
    PRINT '✓ vouchers table created';
END

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
    PRINT '✓ voucher_redemptions table created';
END

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
    PRINT '✓ voucher_audits table created';
END

-- =====================================================
-- EXTENDED TABLES
-- =====================================================

-- Classes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[classes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[classes] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [name] NVARCHAR(50) NOT NULL,
        [grade] NVARCHAR(10) NOT NULL,
        [academic_year] NVARCHAR(9) NOT NULL,
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [class_teacher_id] UNIQUEIDENTIFIER,
        [capacity] INT DEFAULT 40,
        [current_enrollment] INT DEFAULT 0,
        [room_number] NVARCHAR(20),
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_classes_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id]),
        CONSTRAINT [FK_classes_teachers] FOREIGN KEY ([class_teacher_id]) REFERENCES [dbo].[teachers]([id]),
        CONSTRAINT [UQ_classes] UNIQUE([name], [grade], [academic_year], [institution_id])
    );
    PRINT '✓ classes table created';
END

-- Subjects
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[subjects]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[subjects] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [name] NVARCHAR(100) NOT NULL,
        [code] NVARCHAR(20) UNIQUE NOT NULL,
        [description] NVARCHAR(MAX),
        [grade_level] NVARCHAR(10),
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_subjects_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id])
    );
    PRINT '✓ subjects table created';
END

-- Study Sessions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[study_sessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[study_sessions] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [user_id] UNIQUEIDENTIFIER NOT NULL,
        [subject] NVARCHAR(100) NOT NULL,
        [topic] NVARCHAR(255) NOT NULL,
        [session_type] NVARCHAR(50) DEFAULT 'practice' CHECK ([session_type] IN ('practice', 'quiz', 'revision', 'ai_assisted')),
        [duration_minutes] INT,
        [questions_count] INT DEFAULT 0,
        [correct_answers] INT DEFAULT 0,
        [score] DECIMAL(5,2),
        [difficulty_level] NVARCHAR(20) DEFAULT 'medium' CHECK ([difficulty_level] IN ('easy', 'medium', 'hard')),
        [session_data] NVARCHAR(MAX),
        [started_at] DATETIME2 DEFAULT GETUTCDATE(),
        [completed_at] DATETIME2,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_study_sessions_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
    PRINT '✓ study_sessions table created';
END

-- Announcements
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[announcements]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[announcements] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [title] NVARCHAR(255) NOT NULL,
        [content] NVARCHAR(MAX) NOT NULL,
        [priority] NVARCHAR(20) DEFAULT 'normal' CHECK ([priority] IN ('low', 'normal', 'high', 'urgent')),
        [target_audience] NVARCHAR(50) CHECK ([target_audience] IN ('all', 'students', 'parents', 'teachers', 'staff')),
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [created_by] UNIQUEIDENTIFIER NOT NULL,
        [is_published] BIT DEFAULT 0,
        [published_at] DATETIME2,
        [expiry_date] DATETIME2,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_announcements_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id]),
        CONSTRAINT [FK_announcements_users] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id])
    );
    PRINT '✓ announcements table created';
END

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

-- Study Session Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_study_sessions_user')
    CREATE INDEX [idx_study_sessions_user] ON [dbo].[study_sessions]([user_id]);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

PRINT 'Inserting sample data...';

-- Sample Institution
IF NOT EXISTS (SELECT * FROM [dbo].[institutions] WHERE [code] = 'DEMO001')
BEGIN
    INSERT INTO [dbo].[institutions] ([code], [name], [type], [email]) VALUES
    ('DEMO001', 'Demo School', 'Primary School', 'info@demoschool.com');
    PRINT '✓ Demo institution created';
END

-- Sample Users
IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [username] = 'principal')
BEGIN
    INSERT INTO [dbo].[users] ([username], [email], [password_hash], [role], [institution_id]) VALUES
    ('principal', 'principal@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Principal', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
    PRINT '✓ Principal user created';
END

IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [username] = 'teacher')
BEGIN
    INSERT INTO [dbo].[users] ([username], [email], [password_hash], [role], [institution_id]) VALUES
    ('teacher', 'teacher@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Teacher', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
    PRINT '✓ Teacher user created';
END

IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [username] = 'parent')
BEGIN
    INSERT INTO [dbo].[users] ([username], [email], [password_hash], [role], [institution_id]) VALUES
    ('parent', 'parent@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Parent', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
    PRINT '✓ Parent user created';
END

IF NOT EXISTS (SELECT * FROM [dbo].[users] WHERE [username] = 'learner')
BEGIN
    INSERT INTO [dbo].[users] ([username], [email], [password_hash], [role], [institution_id]) VALUES
    ('learner', 'learner@demoschool.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Learner', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
    PRINT '✓ Learner user created';
END

-- Sample Subjects
IF NOT EXISTS (SELECT * FROM [dbo].[subjects] WHERE [code] = 'MATH001')
BEGIN
    INSERT INTO [dbo].[subjects] ([name], [code], [description], [grade_level], [institution_id]) VALUES
    ('Mathematics', 'MATH001', 'Core mathematics curriculum', 'Grade 8-12', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
    PRINT '✓ Mathematics subject created';
END

IF NOT EXISTS (SELECT * FROM [dbo].[subjects] WHERE [code] = 'ENG001')
BEGIN
    INSERT INTO [dbo].[subjects] ([name], [code], [description], [grade_level], [institution_id]) VALUES
    ('English', 'ENG001', 'English language and literature', 'Grade 8-12', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
    PRINT '✓ English subject created';
END

-- Sample Announcement
IF NOT EXISTS (SELECT * FROM [dbo].[announcements] WHERE [title] = 'Welcome to the New Academic Year')
BEGIN
    INSERT INTO [dbo].[announcements] ([title], [content], [priority], [target_audience], [institution_id], [created_by], [is_published]) VALUES
    ('Welcome to the New Academic Year', 'Welcome back students and staff! We are excited to start another successful academic year.', 'normal', 'all', 
     (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'), 
     (SELECT [id] FROM [dbo].[users] WHERE [username] = 'principal'), 1);
    PRINT '✓ Welcome announcement created';
END

-- =====================================================
-- VERIFICATION
-- =====================================================

PRINT '';
PRINT '========================================';
PRINT 'TENANT DATABASE VERIFICATION';
PRINT '========================================';

-- Check tables
DECLARE @tableCount INT = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE');
PRINT 'Total tables: ' + CAST(@tableCount AS NVARCHAR(10));

-- Check users
DECLARE @userCount INT = (SELECT COUNT(*) FROM [dbo].[users]);
PRINT 'Total users: ' + CAST(@userCount AS NVARCHAR(10));

-- Check subjects
DECLARE @subjectCount INT = (SELECT COUNT(*) FROM [dbo].[subjects]);
PRINT 'Total subjects: ' + CAST(@subjectCount AS NVARCHAR(10));

-- Check announcements
DECLARE @announcementCount INT = (SELECT COUNT(*) FROM [dbo].[announcements]);
PRINT 'Total announcements: ' + CAST(@announcementCount AS NVARCHAR(10));

PRINT '';
PRINT '========================================';
PRINT 'TENANT SCHEMA APPLIED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';
PRINT 'Demo Credentials:';
PRINT 'Principal: principal@demoschool.com / password123';
PRINT 'Teacher: teacher@demoschool.com / password123';
PRINT 'Parent: parent@demoschool.com / password123';
PRINT 'Learner: learner@demoschool.com / password123';
PRINT '';
PRINT 'Your PSCTECH platform is ready for testing!';
PRINT '========================================';
