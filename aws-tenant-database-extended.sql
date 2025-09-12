-- AWS Tenant Database Extended Schema for PSCTECH (SQL Server Version)
-- Additional tables for comprehensive multi-tenant functionality

-- =====================================================
-- ATTENDANCE MANAGEMENT TABLES
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
END
GO

-- Attendance Records
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[attendance_records]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[attendance_records] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [student_id] UNIQUEIDENTIFIER NOT NULL,
        [class_id] UNIQUEIDENTIFIER NOT NULL,
        [date] DATE NOT NULL,
        [status] NVARCHAR(20) NOT NULL CHECK ([status] IN ('present', 'absent', 'late', 'excused', 'sick')),
        [time_in] TIME,
        [time_out] TIME,
        [reason] NVARCHAR(MAX),
        [recorded_by] UNIQUEIDENTIFIER,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_attendance_records_students] FOREIGN KEY ([student_id]) REFERENCES [dbo].[students]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_attendance_records_classes] FOREIGN KEY ([class_id]) REFERENCES [dbo].[classes]([id]),
        CONSTRAINT [FK_attendance_records_users] FOREIGN KEY ([recorded_by]) REFERENCES [dbo].[users]([id]),
        CONSTRAINT [UQ_attendance_records] UNIQUE([student_id], [class_id], [date])
    );
END
GO

-- =====================================================
-- ASSESSMENT AND PERFORMANCE TABLES
-- =====================================================

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
END
GO

-- Assessments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[assessments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[assessments] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [title] NVARCHAR(255) NOT NULL,
        [description] NVARCHAR(MAX),
        [subject_id] UNIQUEIDENTIFIER NOT NULL,
        [class_id] UNIQUEIDENTIFIER NOT NULL,
        [assessment_type] NVARCHAR(50) NOT NULL CHECK ([assessment_type] IN ('Test', 'Exam', 'Assignment', 'Project', 'Quiz', 'Homework')),
        [total_marks] INT NOT NULL,
        [weight_percentage] DECIMAL(5,2) DEFAULT 100.00,
        [due_date] DATETIME2,
        [duration_minutes] INT,
        [instructions] NVARCHAR(MAX),
        [created_by] UNIQUEIDENTIFIER NOT NULL,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_assessments_subjects] FOREIGN KEY ([subject_id]) REFERENCES [dbo].[subjects]([id]),
        CONSTRAINT [FK_assessments_classes] FOREIGN KEY ([class_id]) REFERENCES [dbo].[classes]([id]),
        CONSTRAINT [FK_assessments_users] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Assessment Results
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[assessment_results]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[assessment_results] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [assessment_id] UNIQUEIDENTIFIER NOT NULL,
        [student_id] UNIQUEIDENTIFIER NOT NULL,
        [marks_obtained] DECIMAL(5,2) NOT NULL,
        [percentage] DECIMAL(5,2),
        [grade] NVARCHAR(5),
        [remarks] NVARCHAR(MAX),
        [submitted_at] DATETIME2,
        [graded_by] UNIQUEIDENTIFIER,
        [graded_at] DATETIME2,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_assessment_results_assessments] FOREIGN KEY ([assessment_id]) REFERENCES [dbo].[assessments]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_assessment_results_students] FOREIGN KEY ([student_id]) REFERENCES [dbo].[students]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_assessment_results_users] FOREIGN KEY ([graded_by]) REFERENCES [dbo].[users]([id]),
        CONSTRAINT [UQ_assessment_results] UNIQUE([assessment_id], [student_id])
    );
END
GO

-- =====================================================
-- STUDY ZONE EXTENDED TABLES
-- =====================================================

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
END
GO

-- AI Study Materials
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ai_study_materials]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ai_study_materials] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [subject] NVARCHAR(100) NOT NULL,
        [topic] NVARCHAR(255) NOT NULL,
        [grade_level] NVARCHAR(10),
        [material_type] NVARCHAR(50) CHECK ([material_type] IN ('question_bank', 'notes', 'practice_test', 'explanation')),
        [content] NVARCHAR(MAX) NOT NULL,
        [difficulty_level] NVARCHAR(20) DEFAULT 'medium',
        [tags] NVARCHAR(MAX),
        [usage_count] INT DEFAULT 0,
        [rating] DECIMAL(3,2) DEFAULT 0.00,
        [created_by] UNIQUEIDENTIFIER,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_ai_study_materials_users] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- =====================================================
-- COMMUNICATION TABLES
-- =====================================================

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
END
GO

-- Messages
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[messages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[messages] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [sender_id] UNIQUEIDENTIFIER NOT NULL,
        [recipient_id] UNIQUEIDENTIFIER NOT NULL,
        [subject] NVARCHAR(255),
        [content] NVARCHAR(MAX) NOT NULL,
        [message_type] NVARCHAR(20) DEFAULT 'internal' CHECK ([message_type] IN ('internal', 'email', 'sms')),
        [priority] NVARCHAR(20) DEFAULT 'normal',
        [is_read] BIT DEFAULT 0,
        [read_at] DATETIME2,
        [is_deleted] BIT DEFAULT 0,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_messages_sender] FOREIGN KEY ([sender_id]) REFERENCES [dbo].[users]([id]),
        CONSTRAINT [FK_messages_recipient] FOREIGN KEY ([recipient_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- =====================================================
-- ADDITIONAL INDEXES
-- =====================================================

-- Attendance Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_attendance_student_date')
    CREATE INDEX [idx_attendance_student_date] ON [dbo].[attendance_records]([student_id], [date]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_attendance_class_date')
    CREATE INDEX [idx_attendance_class_date] ON [dbo].[attendance_records]([class_id], [date]);

-- Assessment Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_assessments_subject')
    CREATE INDEX [idx_assessments_subject] ON [dbo].[assessments]([subject_id]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_assessments_class')
    CREATE INDEX [idx_assessments_class] ON [dbo].[assessments]([class_id]);

-- Study Session Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_study_sessions_user')
    CREATE INDEX [idx_study_sessions_user] ON [dbo].[study_sessions]([user_id]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_study_sessions_subject')
    CREATE INDEX [idx_study_sessions_subject] ON [dbo].[study_sessions]([subject]);

-- Message Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_messages_sender')
    CREATE INDEX [idx_messages_sender] ON [dbo].[messages]([sender_id]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_messages_recipient')
    CREATE INDEX [idx_messages_recipient] ON [dbo].[messages]([recipient_id]);

-- =====================================================
-- SAMPLE DATA FOR EXTENDED TABLES
-- =====================================================

-- Sample Subjects
IF NOT EXISTS (SELECT * FROM [dbo].[subjects] WHERE [code] = 'MATH001')
BEGIN
    INSERT INTO [dbo].[subjects] ([name], [code], [description], [grade_level], [institution_id]) VALUES
    ('Mathematics', 'MATH001', 'Core mathematics curriculum', 'Grade 8-12', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
END

IF NOT EXISTS (SELECT * FROM [dbo].[subjects] WHERE [code] = 'ENG001')
BEGIN
    INSERT INTO [dbo].[subjects] ([name], [code], [description], [grade_level], [institution_id]) VALUES
    ('English', 'ENG001', 'English language and literature', 'Grade 8-12', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'));
END

-- Sample Class
IF NOT EXISTS (SELECT * FROM [dbo].[classes] WHERE [name] = '8A' AND [academic_year] = '2024-2025')
BEGIN
    INSERT INTO [dbo].[classes] ([name], [grade], [academic_year], [institution_id], [class_teacher_id]) VALUES
    ('8A', 'Grade 8', '2024-2025', (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'), 
     (SELECT [id] FROM [dbo].[teachers] WHERE [employee_number] = 'T001'));
END

-- Sample Announcement
IF NOT EXISTS (SELECT * FROM [dbo].[announcements] WHERE [title] = 'Welcome to the New Academic Year')
BEGIN
    INSERT INTO [dbo].[announcements] ([title], [content], [priority], [target_audience], [institution_id], [created_by], [is_published]) VALUES
    ('Welcome to the New Academic Year', 'Welcome back students and staff! We are excited to start another successful academic year.', 'normal', 'all', 
     (SELECT [id] FROM [dbo].[institutions] WHERE [code] = 'DEMO001'), 
     (SELECT [id] FROM [dbo].[users] WHERE [username] = 'principal'), 1);
END

PRINT 'Extended tenant database schema created successfully!';








