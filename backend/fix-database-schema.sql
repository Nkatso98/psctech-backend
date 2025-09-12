-- Fix Database Schema Mismatch - PSC Tech Backend
-- This script adds the missing tables and columns that the C# backend expects
-- Run this on your psctech_main database

USE [psctech_main];
GO

PRINT '🔧 Fixing database schema to match C# backend models...';
GO

-- =====================================================
-- CREATE MISSING TABLES THAT C# BACKEND EXPECTS
-- =====================================================

-- Create Institutions table (C# backend expects this)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[institutions]') AND type in (N'U'))
BEGIN
    CREATE TABLE institutions (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(255) NOT NULL,
        code NVARCHAR(50) NOT NULL UNIQUE,
        type NVARCHAR(20) NOT NULL CHECK (type IN ('primary', 'secondary', 'combined')),
        district NVARCHAR(100) NULL,
        province NVARCHAR(100) NULL,
        country NVARCHAR(100) DEFAULT 'South Africa',
        address NVARCHAR(MAX) NULL,
        phone NVARCHAR(20) NULL,
        email NVARCHAR(255) NULL,
        website NVARCHAR(255) NULL,
        logo_url NVARCHAR(500) NULL,
        subscription_plan NVARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
        subscription_status NVARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'suspended')),
        subscription_expiry DATE NULL,
        max_users INT DEFAULT 100,
        max_students INT DEFAULT 1000,
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
        is_active BIT DEFAULT 1
    );
    PRINT '✅ Table "institutions" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "institutions" already exists.';
END
GO

-- Create Students table (C# backend expects this)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[students]') AND type in (N'U'))
BEGIN
    CREATE TABLE students (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        student_number NVARCHAR(50) NOT NULL UNIQUE,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        grade NVARCHAR(10) NOT NULL,
        institution_id UNIQUEIDENTIFIER NOT NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT '✅ Table "students" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "students" already exists.';
END
GO

-- Create Teachers table (C# backend expects this)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[teachers]') AND type in (N'U'))
BEGIN
    CREATE TABLE teachers (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        employee_number NVARCHAR(50) NOT NULL UNIQUE,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        subject NVARCHAR(100) NOT NULL,
        institution_id UNIQUEIDENTIFIER NOT NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT '✅ Table "teachers" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "teachers" already exists.';
END
GO

-- =====================================================
-- FIX EXISTING TABLES TO MATCH C# MODELS
-- =====================================================

-- Fix Users table to match C# model
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    -- Add missing columns that C# backend expects
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'password_hash')
    BEGIN
        ALTER TABLE users ADD password_hash NVARCHAR(255) NULL;
        PRINT '✅ Added password_hash column to users table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'first_name')
    BEGIN
        ALTER TABLE users ADD first_name NVARCHAR(100) NULL;
        PRINT '✅ Added first_name column to users table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'last_name')
    BEGIN
        ALTER TABLE users ADD last_name NVARCHAR(100) NULL;
        PRINT '✅ Added last_name column to users table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'created_at')
    BEGIN
        ALTER TABLE users ADD created_at DATETIME2(7) DEFAULT GETUTCDATE();
        PRINT '✅ Added created_at column to users table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'updated_at')
    BEGIN
        ALTER TABLE users ADD updated_at DATETIME2(7) DEFAULT GETUTCDATE();
        PRINT '✅ Added updated_at column to users table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'last_login')
    BEGIN
        ALTER TABLE users ADD last_login DATETIME2(7) NULL;
        PRINT '✅ Added last_login column to users table.';
    END
    
    -- Update existing user data to populate new columns
    UPDATE u SET 
        first_name = up.first_name,
        last_name = up.last_name
    FROM users u
    INNER JOIN user_profiles up ON u.id = up.user_id
    WHERE u.first_name IS NULL OR u.last_name IS NULL;
    
    PRINT '✅ Updated existing user data with profile information.';
END
GO

-- Fix Vouchers table to match C# model
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    -- Add missing columns that C# backend expects
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'code')
    BEGIN
        ALTER TABLE vouchers ADD code NVARCHAR(8) NULL;
        PRINT '✅ Added code column to vouchers table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'value')
    BEGIN
        ALTER TABLE vouchers ADD value INT NULL;
        PRINT '✅ Added value column to vouchers table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'learner_count')
    BEGIN
        ALTER TABLE vouchers ADD learner_count INT NULL;
        PRINT '✅ Added learner_count column to vouchers table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'parent_name')
    BEGIN
        ALTER TABLE vouchers ADD parent_name NVARCHAR(255) NULL;
        PRINT '✅ Added parent_name column to vouchers table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'issued_by_user_id')
    BEGIN
        ALTER TABLE vouchers ADD issued_by_user_id UNIQUEIDENTIFIER NULL;
        PRINT '✅ Added issued_by_user_id column to vouchers table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'redeemed_by_user_id')
    BEGIN
        ALTER TABLE vouchers ADD redeemed_by_user_id UNIQUEIDENTIFIER NULL;
        PRINT '✅ Added redeemed_by_user_id column to vouchers table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'issued_date')
    BEGIN
        ALTER TABLE vouchers ADD issued_date DATETIME2(7) DEFAULT GETUTCDATE();
        PRINT '✅ Added issued_date column to vouchers table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'redemption_attempts')
    BEGIN
        ALTER TABLE vouchers ADD redemption_attempts INT DEFAULT 0;
        PRINT '✅ Added redemption_attempts column to vouchers table.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND name = 'max_redemption_attempts')
    BEGIN
        ALTER TABLE vouchers ADD max_redemption_attempts INT DEFAULT 5;
        PRINT '✅ Added max_redemption_attempts column to vouchers table.';
    END
    
    -- Map existing data to new columns
    UPDATE vouchers SET 
        value = denomination,
        learner_count = learner_count,
        parent_name = parent_guardian_name,
        code = LEFT(code_hash, 8)  -- Use first 8 chars of hash as code
    WHERE value IS NULL OR learner_count IS NULL OR parent_name IS NULL OR code IS NULL;
    
    PRINT '✅ Mapped existing voucher data to new columns.';
END
GO

-- =====================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key for students
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_students_institution')
BEGIN
    ALTER TABLE students ADD CONSTRAINT FK_students_institution 
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT '✅ Foreign key FK_students_institution added.';
END

-- Add foreign key for teachers
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_teachers_institution')
BEGIN
    ALTER TABLE teachers ADD CONSTRAINT FK_teachers_institution 
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT '✅ Foreign key FK_teachers_institution added.';
END

-- Add foreign key for vouchers
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_vouchers_institution')
BEGIN
    ALTER TABLE vouchers ADD CONSTRAINT FK_vouchers_institution 
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT '✅ Foreign key FK_vouchers_institution added.';
END

-- =====================================================
-- INSERT INITIAL DATA
-- =====================================================

-- Insert initial institution if not exists
IF NOT EXISTS (SELECT * FROM institutions WHERE code = 'MASTER001')
BEGIN
    INSERT INTO institutions (name, code, type, district, province, country, address, phone, email)
    VALUES ('Master Institution', 'MASTER001', 'combined', 'Central', 'Gauteng', 'South Africa', '123 Main St', '+27123456789', 'admin@master.edu.za');
    PRINT '✅ Initial institution data inserted.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Initial institution data already exists.';
END
GO

-- Insert sample students
IF NOT EXISTS (SELECT * FROM students WHERE student_number = 'ST001')
BEGIN
    INSERT INTO students (student_number, first_name, last_name, grade, institution_id)
    VALUES 
        ('ST001', 'Alice', 'Johnson', 'Grade 10', (SELECT id FROM institutions WHERE code = 'MASTER001')),
        ('ST002', 'Bob', 'Smith', 'Grade 11', (SELECT id FROM institutions WHERE code = 'MASTER001'));
    PRINT '✅ Sample students inserted.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Sample students already exist.';
END
GO

-- Insert sample teachers
IF NOT EXISTS (SELECT * FROM teachers WHERE employee_number = 'EMP001')
BEGIN
    INSERT INTO teachers (employee_number, first_name, last_name, subject, institution_id)
    VALUES 
        ('EMP001', 'Jane', 'Doe', 'Mathematics', (SELECT id FROM institutions WHERE code = 'MASTER001')),
        ('EMP002', 'John', 'Wilson', 'Science', (SELECT id FROM institutions WHERE code = 'MASTER001'));
    PRINT '✅ Sample teachers inserted.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Sample teachers already exist.';
END
GO

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Institutions indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_institutions_code')
BEGIN
    CREATE UNIQUE INDEX IX_institutions_code ON institutions(code);
    PRINT '✅ Index IX_institutions_code created.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_institutions_email')
BEGIN
    CREATE INDEX IX_institutions_email ON institutions(email);
    PRINT '✅ Index IX_institutions_email created.';
END

-- Students indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_students_student_number')
BEGIN
    CREATE UNIQUE INDEX IX_students_student_number ON students(student_number);
    PRINT '✅ Index IX_students_student_number created.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_students_institution_id')
BEGIN
    CREATE INDEX IX_students_institution_id ON students(institution_id);
    PRINT '✅ Index IX_students_institution_id created.';
END

-- Teachers indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_teachers_employee_number')
BEGIN
    CREATE UNIQUE INDEX IX_teachers_employee_number ON teachers(employee_number);
    PRINT '✅ Index IX_teachers_employee_number created.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_teachers_institution_id')
BEGIN
    CREATE INDEX IX_teachers_institution_id ON teachers(institution_id);
    PRINT '✅ Index IX_teachers_institution_id created.';
END

-- Users indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_email')
BEGIN
    CREATE UNIQUE INDEX IX_users_email ON users(email);
    PRINT '✅ Index IX_users_email created.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_institution_id')
BEGIN
    CREATE INDEX IX_users_institution_id ON users(institution_id);
    PRINT '✅ Index IX_users_institution_id created.';
END

-- =====================================================
-- VERIFICATION
-- =====================================================

PRINT '';
PRINT '🔍 Verifying database schema...';
GO

-- Check all tables
SELECT 'Tables in database:' as info;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;
GO

-- Check institutions table structure
SELECT 'Institutions table columns:' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'institutions' 
ORDER BY ORDINAL_POSITION;
GO

-- Check users table structure
SELECT 'Users table columns:' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
ORDER BY ORDINAL_POSITION;
GO

-- Check data counts
SELECT 'Data counts:' as info;
SELECT 'institutions' as table_name, COUNT(*) as record_count FROM institutions
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'students', COUNT(*) FROM students
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL
SELECT 'vouchers', COUNT(*) FROM vouchers;
GO

PRINT '';
PRINT '========================================';
PRINT '✅ Database schema fix completed successfully!';
PRINT 'Current Database: ' + DB_NAME();
PRINT 'Server: psctech-rg.database.windows.net';
PRINT '========================================';
PRINT '';
PRINT '🎯 Your database now matches what the C# backend expects!';
PRINT '🚀 You can now deploy the fixed backend and test registration.';
PRINT '========================================';
