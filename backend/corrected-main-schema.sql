-- =====================================================
-- CORRECTED MAIN DATABASE SETUP (psctech_main)
-- VOUCHER SYSTEM + APPLICATION DATA - Compatible with C# Backend
-- =====================================================

-- Verify we're in the right database
SELECT 'Current Database:' as info, DB_NAME() as database_name;
GO

-- =====================================================
-- CREATE CORE TABLES THAT C# BACKEND EXPECTS
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
-- CREATE VOUCHER SYSTEM TABLES (Your Existing Structure)
-- =====================================================

-- Vouchers Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE vouchers (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        code_hash NVARCHAR(64) NOT NULL,
        code_salt NVARCHAR(32) NOT NULL,
        denomination INT NOT NULL CHECK (denomination IN (5,10,15,20,25,30,35,40,45)),
        parent_guardian_name NVARCHAR(255) NOT NULL,
        learner_count INT NOT NULL CHECK (learner_count BETWEEN 1 AND 10),
        status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
        institution_id VARCHAR(50) NOT NULL,
        issued_by_user_id VARCHAR(50) NOT NULL,
        issued_date DATETIME2(7) DEFAULT GETUTCDATE(),
        redeemed_by_user_id VARCHAR(50),
        redeemed_date DATETIME2(7),
        expiry_date DATETIME2(7),
        is_active BIT DEFAULT 1,
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT '✅ Table "vouchers" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "vouchers" already exists.';
END
GO

-- Voucher Redemptions Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[voucher_redemptions]') AND type in (N'U'))
BEGIN
    CREATE TABLE voucher_redemptions (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        voucher_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        redemption_date DATETIME2(7) DEFAULT GETUTCDATE(),
        status NVARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
        learner_count INT NOT NULL,
        parent_guardian_name NVARCHAR(255) NOT NULL,
        activation_date DATETIME2(7) DEFAULT GETUTCDATE(),
        expiry_date DATETIME2(7),
        notes NVARCHAR(MAX),
        created_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT '✅ Table "voucher_redemptions" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "voucher_redemptions" already exists.';
END
GO

-- Voucher Audits Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[voucher_audits]') AND type in (N'U'))
BEGIN
    CREATE TABLE voucher_audits (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        voucher_id VARCHAR(50) NOT NULL,
        action NVARCHAR(50) NOT NULL CHECK (action IN ('created', 'redeemed', 'expired', 'cancelled', 'viewed')),
        user_id VARCHAR(50),
        details NVARCHAR(MAX),
        ip_address VARCHAR(45),
        user_agent NVARCHAR(500),
        created_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT '✅ Table "voucher_audits" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "voucher_audits" already exists.';
END
GO

-- =====================================================
-- CREATE USER MANAGEMENT TABLES
-- =====================================================

-- Users Table (Enhanced to match C# backend expectations)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE users (
        id VARCHAR(50) PRIMARY KEY,
        username NVARCHAR(100) NOT NULL UNIQUE,
        email NVARCHAR(255) NOT NULL UNIQUE,
        role NVARCHAR(20) NOT NULL CHECK (role IN ('principal', 'teacher', 'parent', 'learner', 'sgb')),
        institution_id VARCHAR(50) NOT NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT '✅ Table "users" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "users" already exists.';
END
GO

-- User Profiles Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_profiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE user_profiles (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id VARCHAR(50) NOT NULL,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        phone NVARCHAR(20),
        address NVARCHAR(MAX),
        profile_picture NVARCHAR(500),
        preferences NVARCHAR(MAX),
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT '✅ Table "user_profiles" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "user_profiles" already exists.';
END
GO

-- Institution Details Table (Keep your existing structure)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[institution_details]') AND type in (N'U'))
BEGIN
    CREATE TABLE institution_details (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        institution_id VARCHAR(50) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        code NVARCHAR(50) NOT NULL,
        type NVARCHAR(20) NOT NULL,
        district NVARCHAR(100),
        province NVARCHAR(100),
        country NVARCHAR(100) DEFAULT 'South Africa',
        address NVARCHAR(MAX),
        phone NVARCHAR(20),
        email NVARCHAR(255),
        website NVARCHAR(255),
        logo_url NVARCHAR(500),
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE()
    );
    PRINT '✅ Table "institution_details" created successfully.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Table "institution_details" already exists.';
END
GO

-- =====================================================
-- ENHANCE EXISTING TABLES FOR C# BACKEND COMPATIBILITY
-- =====================================================

-- Add missing columns to Users table for C# backend
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    -- Add password_hash column
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'password_hash')
    BEGIN
        ALTER TABLE users ADD password_hash NVARCHAR(255) NULL;
        PRINT '✅ Added password_hash column to users table.';
    END
    
    -- Add first_name column
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'first_name')
    BEGIN
        ALTER TABLE users ADD first_name NVARCHAR(100) NULL;
        PRINT '✅ Added first_name column to users table.';
    END
    
    -- Add last_name column
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'last_name')
    BEGIN
        ALTER TABLE users ADD last_name NVARCHAR(100) NULL;
        PRINT '✅ Added last_name column to users table.';
    END
    
    -- Add last_login column
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

-- Insert sample institution details
IF NOT EXISTS (SELECT * FROM institution_details WHERE institution_id = 'MASTER001')
BEGIN
    INSERT INTO institution_details (institution_id, name, code, type, district, province)
    VALUES ('MASTER001', 'Master Institution', 'MASTER001', 'combined', 'Central', 'Gauteng');
    PRINT '✅ Sample institution details inserted.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Sample institution details already exist.';
END
GO

-- Insert sample users
IF NOT EXISTS (SELECT * FROM users WHERE id = 'PRINCIPAL001')
BEGIN
    INSERT INTO users (id, username, email, role, institution_id)
    VALUES 
        ('PRINCIPAL001', 'principal', 'principal@master.edu.za', 'principal', 'MASTER001'),
        ('TEACHER001', 'teacher1', 'teacher1@master.edu.za', 'teacher', 'MASTER001'),
        ('PARENT001', 'parent1', 'parent1@master.edu.za', 'parent', 'MASTER001'),
        ('LEARNER001', 'learner1', 'learner1@master.edu.za', 'learner', 'MASTER001');
    PRINT '✅ Sample users inserted.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Sample users already exist.';
END
GO

-- Insert sample user profiles
IF NOT EXISTS (SELECT * FROM user_profiles WHERE user_id = 'PRINCIPAL001')
BEGIN
    INSERT INTO user_profiles (user_id, first_name, last_name)
    VALUES 
        ('PRINCIPAL001', 'John', 'Principal'),
        ('TEACHER001', 'Jane', 'Teacher'),
        ('PARENT001', 'Bob', 'Parent'),
        ('LEARNER001', 'Alice', 'Learner');
    PRINT '✅ Sample user profiles inserted.';
END
ELSE
BEGIN
    PRINT 'ℹ️  Sample user profiles already exist.';
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

-- Voucher indexes (Your existing indexes)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vouchers_status')
BEGIN
    CREATE NONCLUSTERED INDEX IX_vouchers_status ON vouchers(status) INCLUDE (denomination, institution_id);
    PRINT '✅ Index IX_vouchers_status created.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vouchers_institution')
BEGIN
    CREATE NONCLUSTERED INDEX IX_vouchers_institution ON vouchers(institution_id) INCLUDE (status, denomination);
    PRINT '✅ Index IX_vouchers_institution created.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vouchers_issued_by')
BEGIN
    CREATE NONCLUSTERED INDEX IX_vouchers_issued_by ON vouchers(issued_by_user_id) INCLUDE (status, denomination);
    PRINT '✅ Index IX_vouchers_issued_by created.';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vouchers_expiry')
BEGIN
    CREATE NONCLUSTERED INDEX IX_vouchers_expiry ON vouchers(expiry_date) INCLUDE (status, institution_id);
    PRINT '✅ Index IX_vouchers_expiry created.';
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
SELECT 'vouchers', COUNT(*) FROM vouchers
UNION ALL
SELECT 'institution_details', COUNT(*) FROM institution_details;
GO

PRINT '';
PRINT '========================================';
PRINT '✅ Main Database (psctech_main) setup completed successfully!';
PRINT 'Current Database: ' + DB_NAME();
PRINT 'Server: psctech-rg.database.windows.net';
PRINT '========================================';
PRINT '';
PRINT '🎯 Your database now has:';
PRINT '   ✅ Institutions table (C# backend compatible)';
PRINT '   ✅ Students and Teachers tables';
PRINT '   ✅ Enhanced Users table with all required columns';
PRINT '   ✅ Your existing Voucher System tables';
PRINT '   ✅ Institution Details table (your existing structure)';
PRINT '';
PRINT '🚀 You can now deploy the fixed backend and test registration!';
PRINT '========================================';
