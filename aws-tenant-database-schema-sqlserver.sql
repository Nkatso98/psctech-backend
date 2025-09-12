-- AWS Tenant Database Schema for PSCTECH (SQL Server Version)
-- This schema is used for each institution (tenant) with complete data isolation
-- Run this on AWS RDS SQL Server for each tenant database

-- =====================================================
-- TENANT DATABASE SCHEMA
-- =====================================================

-- =====================================================
-- CORE INSTITUTION TABLES
-- =====================================================

-- Institutions (Main tenant table)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[institutions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[institutions] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [code] NVARCHAR(20) UNIQUE NOT NULL,
        [name] NVARCHAR(255) NOT NULL,
        [type] NVARCHAR(50) NOT NULL CHECK ([type] IN ('Primary School', 'Secondary School', 'Combined School', 'University', 'College', 'Technical Institute', 'Vocational School')),
        [district] NVARCHAR(100),
        [province] NVARCHAR(100),
        [country] NVARCHAR(100) DEFAULT 'South Africa',
        [address] NVARCHAR(MAX),
        [phone] NVARCHAR(20),
        [email] NVARCHAR(255),
        [website] NVARCHAR(255),
        [logo_url] NVARCHAR(500),
        [subscription_plan] NVARCHAR(20) DEFAULT 'basic',
        [subscription_status] NVARCHAR(20) DEFAULT 'active',
        [subscription_expiry] DATETIME2,
        [max_users] INT DEFAULT 100,
        [max_students] INT DEFAULT 500,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- Institution Details (Extended information)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[institution_details]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[institution_details] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [principal_name] NVARCHAR(255),
        [principal_email] NVARCHAR(255),
        [principal_phone] NVARCHAR(20),
        [academic_year] NVARCHAR(9), -- e.g., "2024-2025"
        [term_start_date] DATE,
        [term_end_date] DATE,
        [school_hours_start] TIME DEFAULT '07:30',
        [school_hours_end] TIME DEFAULT '14:30',
        [timezone] NVARCHAR(50) DEFAULT 'Africa/Johannesburg',
        [language_of_instruction] NVARCHAR(50) DEFAULT 'English',
        [additional_languages] NVARCHAR(MAX), -- JSON array of additional languages
        [facilities] NVARCHAR(MAX), -- JSON array of available facilities
        [policies] NVARCHAR(MAX), -- JSON object of school policies and rules
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_institution_details_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id])
    );
END
GO

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Users (Authentication and basic info)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [username] NVARCHAR(100) UNIQUE NOT NULL,
        [email] NVARCHAR(255) UNIQUE NOT NULL,
        [password_hash] NVARCHAR(255) NOT NULL,
        [role] NVARCHAR(20) NOT NULL CHECK ([role] IN ('Principal', 'Teacher', 'Parent', 'Learner', 'SGB', 'Admin')),
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [is_active] BIT DEFAULT 1,
        [email_verified] BIT DEFAULT 0,
        [password_reset_token] NVARCHAR(255),
        [password_reset_token_expiry] DATETIME2,
        [last_login] DATETIME2,
        [login_attempts] INT DEFAULT 0,
        [locked_until] DATETIME2,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_users_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id])
    );
END
GO

-- User Profiles (Extended user information)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_profiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[user_profiles] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [user_id] UNIQUEIDENTIFIER NOT NULL,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [phone] NVARCHAR(20),
        [address] NVARCHAR(MAX),
        [date_of_birth] DATE,
        [gender] NVARCHAR(10) CHECK ([gender] IN ('Male', 'Female', 'Other')),
        [profile_picture] NVARCHAR(500),
        [bio] NVARCHAR(MAX),
        [preferences] NVARCHAR(MAX), -- JSON object
        [emergency_contact] NVARCHAR(MAX), -- JSON object
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_user_profiles_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]) ON DELETE CASCADE
    );
END
GO

-- =====================================================
-- STUDENT MANAGEMENT TABLES
-- =====================================================

-- Students
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[students]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[students] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [student_number] NVARCHAR(50) UNIQUE NOT NULL,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [date_of_birth] DATE,
        [gender] NVARCHAR(10) CHECK ([gender] IN ('Male', 'Female', 'Other')),
        [grade] NVARCHAR(10) NOT NULL, -- e.g., "Grade 8", "Grade 9"
        [class] NVARCHAR(20), -- e.g., "8A", "9B"
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [parent_id] UNIQUEIDENTIFIER, -- Link to parent user
        [enrollment_date] DATE DEFAULT GETDATE(),
        [status] NVARCHAR(20) DEFAULT 'active' CHECK ([status] IN ('active', 'inactive', 'graduated', 'transferred')),
        [academic_year] NVARCHAR(9),
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_students_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id]),
        CONSTRAINT [FK_students_users] FOREIGN KEY ([parent_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Student Academic Records
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[student_academic_records]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[student_academic_records] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [student_id] UNIQUEIDENTIFIER NOT NULL,
        [academic_year] NVARCHAR(9) NOT NULL,
        [term] NVARCHAR(20) NOT NULL, -- e.g., "Term 1", "Term 2"
        [grade] NVARCHAR(10) NOT NULL,
        [class] NVARCHAR(20),
        [total_subjects] INT DEFAULT 0,
        [average_score] DECIMAL(5,2),
        [position_in_class] INT,
        [total_students_in_class] INT,
        [remarks] NVARCHAR(MAX),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_student_academic_records_students] FOREIGN KEY ([student_id]) REFERENCES [dbo].[students]([id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_student_academic_records] UNIQUE([student_id], [academic_year], [term])
    );
END
GO

-- =====================================================
-- TEACHER MANAGEMENT TABLES
-- =====================================================

-- Teachers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[teachers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[teachers] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [employee_number] NVARCHAR(50) UNIQUE NOT NULL,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [email] NVARCHAR(255),
        [phone] NVARCHAR(20),
        [date_of_birth] DATE,
        [gender] NVARCHAR(10) CHECK ([gender] IN ('Male', 'Female', 'Other')),
        [qualification] NVARCHAR(255),
        [specialization] NVARCHAR(255), -- Main subject area
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [user_id] UNIQUEIDENTIFIER, -- Link to user account
        [employment_date] DATE DEFAULT GETDATE(),
        [status] NVARCHAR(20) DEFAULT 'active' CHECK ([status] IN ('active', 'inactive', 'resigned', 'retired')),
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_teachers_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id]),
        CONSTRAINT [FK_teachers_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Teacher Subjects (Many-to-many relationship)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[teacher_subjects]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[teacher_subjects] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [teacher_id] UNIQUEIDENTIFIER NOT NULL,
        [subject_name] NVARCHAR(100) NOT NULL,
        [grade_level] NVARCHAR(10), -- e.g., "Grade 8-12"
        [is_primary] BIT DEFAULT 0, -- Primary subject for this teacher
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_teacher_subjects_teachers] FOREIGN KEY ([teacher_id]) REFERENCES [dbo].[teachers]([id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_teacher_subjects] UNIQUE([teacher_id], [subject_name], [grade_level])
    );
END
GO

-- =====================================================
-- SUBJECT AND CURRICULUM TABLES
-- =====================================================

-- Subjects
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[subjects]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[subjects] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [name] NVARCHAR(100) NOT NULL,
        [code] NVARCHAR(20) UNIQUE NOT NULL,
        [description] NVARCHAR(MAX),
        [grade_level] NVARCHAR(10), -- e.g., "Grade 8-12"
        [credits] INT DEFAULT 1,
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_subjects_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id])
    );
END
GO

-- Classes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[classes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[classes] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [name] NVARCHAR(50) NOT NULL, -- e.g., "8A", "9B"
        [grade] NVARCHAR(10) NOT NULL,
        [academic_year] NVARCHAR(9) NOT NULL,
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [class_teacher_id] UNIQUEIDENTIFIER,
        [capacity] INT DEFAULT 40,
        [current_enrollment] INT DEFAULT 0,
        [room_number] NVARCHAR(20),
        [schedule] NVARCHAR(MAX), -- JSON object
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_classes_institutions] FOREIGN KEY ([institution_id]) REFERENCES [dbo].[institutions]([id]),
        CONSTRAINT [FK_classes_teachers] FOREIGN KEY ([class_teacher_id]) REFERENCES [dbo].[teachers]([id]),
        CONSTRAINT [UQ_classes] UNIQUE([name], [grade], [academic_year], [institution_id])
    );
END
GO

-- Class Allocations (Students to Classes)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[class_allocations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[class_allocations] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [student_id] UNIQUEIDENTIFIER NOT NULL,
        [class_id] UNIQUEIDENTIFIER NOT NULL,
        [academic_year] NVARCHAR(9) NOT NULL,
        [allocation_date] DATE DEFAULT GETDATE(),
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_class_allocations_students] FOREIGN KEY ([student_id]) REFERENCES [dbo].[students]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_class_allocations_classes] FOREIGN KEY ([class_id]) REFERENCES [dbo].[classes]([id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_class_allocations] UNIQUE([student_id], [class_id], [academic_year])
    );
END
GO

-- =====================================================
-- ATTENDANCE MANAGEMENT TABLES
-- =====================================================

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
        [reason] NVARCHAR(MAX), -- For absences or late arrivals
        [recorded_by] UNIQUEIDENTIFIER,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_attendance_records_students] FOREIGN KEY ([student_id]) REFERENCES [dbo].[students]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_attendance_records_classes] FOREIGN KEY ([class_id]) REFERENCES [dbo].[classes]([id]),
        CONSTRAINT [FK_attendance_records_users] FOREIGN KEY ([recorded_by]) REFERENCES [dbo].[users]([id]),
        CONSTRAINT [UQ_attendance_records] UNIQUE([student_id], [class_id], [date])
    );
END
GO

-- Attendance Summary (Aggregated data for reporting)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[attendance_summary]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[attendance_summary] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [student_id] UNIQUEIDENTIFIER NOT NULL,
        [academic_year] NVARCHAR(9) NOT NULL,
        [term] NVARCHAR(20) NOT NULL,
        [total_days] INT DEFAULT 0,
        [days_present] INT DEFAULT 0,
        [days_absent] INT DEFAULT 0,
        [days_late] INT DEFAULT 0,
        [attendance_percentage] DECIMAL(5,2),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_attendance_summary_students] FOREIGN KEY ([student_id]) REFERENCES [dbo].[students]([id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_attendance_summary] UNIQUE([student_id], [academic_year], [term])
    );
END
GO

-- =====================================================
-- ASSESSMENT AND PERFORMANCE TABLES
-- =====================================================

-- Assessments (Tests, Exams, Assignments)
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
        [duration_minutes] INT, -- For timed assessments
        [instructions] NVARCHAR(MAX),
        [created_by] UNIQUEIDENTIFIER NOT NULL,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
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
        [grade] NVARCHAR(5), -- e.g., "A", "B", "C"
        [remarks] NVARCHAR(MAX),
        [submitted_at] DATETIME2,
        [graded_by] UNIQUEIDENTIFIER,
        [graded_at] DATETIME2,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_assessment_results_assessments] FOREIGN KEY ([assessment_id]) REFERENCES [dbo].[assessments]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_assessment_results_students] FOREIGN KEY ([student_id]) REFERENCES [dbo].[students]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_assessment_results_users] FOREIGN KEY ([graded_by]) REFERENCES [dbo].[users]([id]),
        CONSTRAINT [UQ_assessment_results] UNIQUE([assessment_id], [student_id])
    );
END
GO

-- Performance Analytics
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[performance_analytics]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[performance_analytics] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [student_id] UNIQUEIDENTIFIER NOT NULL,
        [subject_id] UNIQUEIDENTIFIER NOT NULL,
        [academic_year] NVARCHAR(9) NOT NULL,
        [term] NVARCHAR(20) NOT NULL,
        [total_assessments] INT DEFAULT 0,
        [average_score] DECIMAL(5,2),
        [highest_score] DECIMAL(5,2),
        [lowest_score] DECIMAL(5,2),
        [improvement_rate] DECIMAL(5,2), -- Percentage improvement from previous term
        [rank_in_class] INT,
        [total_students_in_class] INT,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_performance_analytics_students] FOREIGN KEY ([student_id]) REFERENCES [dbo].[students]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_performance_analytics_subjects] FOREIGN KEY ([subject_id]) REFERENCES [dbo].[subjects]([id]),
        CONSTRAINT [UQ_performance_analytics] UNIQUE([student_id], [subject_id], [academic_year], [term])
    );
END
GO

-- =====================================================
-- STUDY ZONE AND AI FEATURES TABLES
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
        [session_data] NVARCHAR(MAX), -- JSON object
        [started_at] DATETIME2 DEFAULT GETUTCDATE(),
        [completed_at] DATETIME2,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_study_sessions_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Study Results
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[study_results]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[study_results] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [user_id] UNIQUEIDENTIFIER NOT NULL,
        [session_id] UNIQUEIDENTIFIER NOT NULL,
        [total_questions] INT NOT NULL,
        [correct_answers] INT NOT NULL,
        [score] DECIMAL(5,2) NOT NULL,
        [time_spent] INT, -- in seconds
        [answers] NVARCHAR(MAX), -- JSON object
        [recommendations] NVARCHAR(MAX), -- JSON object
        [weak_areas] NVARCHAR(MAX), -- JSON object
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_study_results_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id]),
        CONSTRAINT [FK_study_results_study_sessions] FOREIGN KEY ([session_id]) REFERENCES [dbo].[study_sessions]([id])
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
        [content] NVARCHAR(MAX) NOT NULL, -- JSON object
        [difficulty_level] NVARCHAR(20) DEFAULT 'medium',
        [tags] NVARCHAR(MAX), -- JSON array
        [usage_count] INT DEFAULT 0,
        [rating] DECIMAL(3,2) DEFAULT 0.00,
        [created_by] UNIQUEIDENTIFIER,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_ai_study_materials_users] FOREIGN KEY ([created_by]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- =====================================================
-- VOUCHER SYSTEM TABLES
-- =====================================================

-- Vouchers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vouchers] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [voucher_code] NVARCHAR(19) UNIQUE NOT NULL, -- Format: XXXX-XXXX-XXXX-XXXX
        [denomination] DECIMAL(10,2) NOT NULL,
        [parent_guardian_name] NVARCHAR(255) NOT NULL,
        [learner_count] INT NOT NULL CHECK ([learner_count] BETWEEN 1 AND 10),
        [status] NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK ([status] IN ('active', 'redeemed', 'expired', 'cancelled')),
        [institution_id] UNIQUEIDENTIFIER NOT NULL,
        [issued_by_user_id] UNIQUEIDENTIFIER NOT NULL,
        [issued_date] DATETIME2 DEFAULT GETUTCDATE(),
        [redeemed_by_user_id] UNIQUEIDENTIFIER,
        [redeemed_date] DATETIME2,
        [expiry_date] DATETIME2,
        [is_active] BIT DEFAULT 1,
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
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
        [status] NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK ([status] IN ('active', 'expired', 'cancelled')),
        [learner_count] INT NOT NULL,
        [parent_guardian_name] NVARCHAR(255) NOT NULL,
        [activation_date] DATETIME2 DEFAULT GETUTCDATE(),
        [expiry_date] DATETIME2,
        [notes] NVARCHAR(MAX),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_voucher_redemptions_vouchers] FOREIGN KEY ([voucher_id]) REFERENCES [dbo].[vouchers]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_voucher_redemptions_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- Voucher Audit Trail
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[voucher_audits]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[voucher_audits] (
        [id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [voucher_id] UNIQUEIDENTIFIER NOT NULL,
        [action] NVARCHAR(50) NOT NULL, -- e.g., 'created', 'redeemed', 'expired', 'cancelled'
        [user_id] UNIQUEIDENTIFIER,
        [details] NVARCHAR(MAX), -- JSON object
        [ip_address] NVARCHAR(45),
        [user_agent] NVARCHAR(MAX),
        [created_at] DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_voucher_audits_vouchers] FOREIGN KEY ([voucher_id]) REFERENCES [dbo].[vouchers]([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_voucher_audits_users] FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([id])
    );
END
GO

-- =====================================================
-- COMMUNICATION AND NOTIFICATIONS TABLES
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
        [updated_at] DATETIME2 DEFAULT GETUTCDATE(),
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
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_institution')
    CREATE INDEX [idx_users_institution] ON [dbo].[users]([institution_id]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_role')
    CREATE INDEX [idx_users_role] ON [dbo].[users]([role]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_users_email')
    CREATE INDEX [idx_users_email] ON [dbo].[users]([email]);

-- Students Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_students_institution')
    CREATE INDEX [idx_students_institution] ON [dbo].[students]([institution_id]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_students_grade')
    CREATE INDEX [idx_students_grade] ON [dbo].[students]([grade]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_students_parent')
    CREATE INDEX [idx_students_parent] ON [dbo].[students]([parent_id]);

-- Teachers Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_teachers_institution')
    CREATE INDEX [idx_teachers_institution] ON [dbo].[teachers]([institution_id]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_teachers_employee_number')
    CREATE INDEX [idx_teachers_employee_number] ON [dbo].[teachers]([employee_number]);

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

-- Voucher Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_vouchers_code')
    CREATE INDEX [idx_vouchers_code] ON [dbo].[vouchers]([voucher_code]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_vouchers_institution')
    CREATE INDEX [idx_vouchers_institution] ON [dbo].[vouchers]([institution_id]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_vouchers_status')
    CREATE INDEX [idx_vouchers_status] ON [dbo].[vouchers]([status]);

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
-- INITIAL DATA FOR TESTING
-- =====================================================

-- Insert sample institution
IF NOT EXISTS (SELECT * FROM [dbo].[institutions] WHERE [code] = 'DEMO001')
BEGIN
    INSERT INTO [dbo].[institutions] ([code], [name], [type], [district], [province], [email], [phone]) VALUES
    ('DEMO001', 'Demo Primary School', 'Primary School', 'Demo District', 'Demo Province', 'info@demoschool.com', '+27123456789');
END

-- Insert sample users for testing
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

-- Insert sample user profiles
IF NOT EXISTS (SELECT * FROM [dbo].[user_profiles] WHERE [user_id] = (SELECT [id] FROM [dbo].[users] WHERE [username] = 'principal'))
BEGIN
    INSERT INTO [dbo].[user_profiles] ([user_id], [first_name], [last_name], [phone]) VALUES
    ((SELECT [id] FROM [dbo].[users] WHERE [username] = 'principal'), 'John', 'Principal', '+27123456789');
END

IF NOT EXISTS (SELECT * FROM [dbo].[user_profiles] WHERE [user_id] = (SELECT [id] FROM [dbo].[users] WHERE [username] = 'teacher'))
BEGIN
    INSERT INTO [dbo].[user_profiles] ([user_id], [first_name], [last_name], [phone]) VALUES
    ((SELECT [id] FROM [dbo].[users] WHERE [username] = 'teacher'), 'Jane', 'Teacher', '+27123456790');
END

IF NOT EXISTS (SELECT * FROM [dbo].[user_profiles] WHERE [user_id] = (SELECT [id] FROM [dbo].[users] WHERE [username] = 'parent'))
BEGIN
    INSERT INTO [dbo].[user_profiles] ([user_id], [first_name], [last_name], [phone]) VALUES
    ((SELECT [id] FROM [dbo].[users] WHERE [username] = 'parent'), 'Bob', 'Parent', '+27123456791');
END

IF NOT EXISTS (SELECT * FROM [dbo].[user_profiles] WHERE [user_id] = (SELECT [id] FROM [dbo].[users] WHERE [username] = 'learner'))
BEGIN
    INSERT INTO [dbo].[user_profiles] ([user_id], [first_name], [last_name], [phone]) VALUES
    ((SELECT [id] FROM [dbo].[users] WHERE [username] = 'learner'), 'Alice', 'Learner', '+27123456792');
END

PRINT 'Tenant database schema created successfully!';








