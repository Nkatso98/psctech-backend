-- PSC Tech Database Schema - Matches C# Models Exactly
-- Run this script on your Azure SQL database to create the correct schema

-- Create Institutions table
IF OBJECT_ID('institutions') IS NULL
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
    PRINT 'Institutions table created successfully';
END
ELSE
BEGIN
    PRINT 'Institutions table already exists';
END

-- Create Users table
IF OBJECT_ID('users') IS NULL
BEGIN
    CREATE TABLE users (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email NVARCHAR(255) NOT NULL UNIQUE,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'principal', 'teacher', 'student')),
        password_hash NVARCHAR(255) NULL,
        institution_id UNIQUEIDENTIFIER NOT NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
        last_login DATETIME2(7) NULL
    );
    PRINT 'Users table created successfully';
END
ELSE
BEGIN
    PRINT 'Users table already exists';
END

-- Create Students table
IF OBJECT_ID('students') IS NULL
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
    PRINT 'Students table created successfully';
END
ELSE
BEGIN
    PRINT 'Students table already exists';
END

-- Create Teachers table
IF OBJECT_ID('teachers') IS NULL
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
    PRINT 'Teachers table created successfully';
END
ELSE
BEGIN
    PRINT 'Teachers table already exists';
END

-- Create Vouchers table
IF OBJECT_ID('vouchers') IS NULL
BEGIN
    CREATE TABLE vouchers (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        code NVARCHAR(8) NOT NULL UNIQUE,
        value INT NOT NULL,
        learner_count INT NOT NULL,
        parent_name NVARCHAR(255) NOT NULL,
        notes NVARCHAR(500) NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
        institution_id UNIQUEIDENTIFIER NOT NULL,
        issued_by_user_id UNIQUEIDENTIFIER NOT NULL,
        redeemed_by_user_id UNIQUEIDENTIFIER NULL,
        issued_date DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
        redeemed_date DATETIME2(7) NULL,
        expiry_date DATETIME2(7) NULL,
        created_at DATETIME2(7) DEFAULT GETUTCDATE(),
        updated_at DATETIME2(7) DEFAULT GETUTCDATE(),
        is_active BIT DEFAULT 1,
        redemption_attempts INT DEFAULT 0,
        max_redemption_attempts INT DEFAULT 5
    );
    PRINT 'Vouchers table created successfully';
END
ELSE
BEGIN
    PRINT 'Vouchers table already exists';
END

-- Add foreign key constraints
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_users_institution')
BEGIN
    ALTER TABLE users ADD CONSTRAINT FK_users_institution 
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT 'Foreign key FK_users_institution added';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_students_institution')
BEGIN
    ALTER TABLE students ADD CONSTRAINT FK_students_institution 
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT 'Foreign key FK_students_institution added';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_teachers_institution')
BEGIN
    ALTER TABLE teachers ADD CONSTRAINT FK_teachers_institution 
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT 'Foreign key FK_teachers_institution added';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_vouchers_institution')
BEGIN
    ALTER TABLE vouchers ADD CONSTRAINT FK_vouchers_institution 
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE;
    PRINT 'Foreign key FK_vouchers_institution added';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_vouchers_issued_by_user')
BEGIN
    ALTER TABLE vouchers ADD CONSTRAINT FK_vouchers_issued_by_user 
        FOREIGN KEY (issued_by_user_id) REFERENCES users(id);
    PRINT 'Foreign key FK_vouchers_issued_by_user added';
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_vouchers_redeemed_by_user')
BEGIN
    ALTER TABLE vouchers ADD CONSTRAINT FK_vouchers_redeemed_by_user 
        FOREIGN KEY (redeemed_by_user_id) REFERENCES users(id);
    PRINT 'Foreign key FK_vouchers_redeemed_by_user added';
END

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_institutions_code')
BEGIN
    CREATE UNIQUE INDEX IX_institutions_code ON institutions(code);
    PRINT 'Index IX_institutions_code created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_email')
BEGIN
    CREATE UNIQUE INDEX IX_users_email ON users(email);
    PRINT 'Index IX_users_email created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_institution_id')
BEGIN
    CREATE INDEX IX_users_institution_id ON users(institution_id);
    PRINT 'Index IX_users_institution_id created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_students_student_number')
BEGIN
    CREATE UNIQUE INDEX IX_students_student_number ON students(student_number);
    PRINT 'Index IX_students_student_number created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_students_institution_id')
BEGIN
    CREATE INDEX IX_students_institution_id ON students(institution_id);
    PRINT 'Index IX_students_institution_id created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_teachers_employee_number')
BEGIN
    CREATE UNIQUE INDEX IX_teachers_employee_number ON teachers(employee_number);
    PRINT 'Index IX_teachers_employee_number created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_teachers_institution_id')
BEGIN
    CREATE INDEX IX_teachers_institution_id ON teachers(institution_id);
    PRINT 'Index IX_teachers_institution_id created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vouchers_code')
BEGIN
    CREATE UNIQUE INDEX IX_vouchers_code ON vouchers(code);
    PRINT 'Index IX_vouchers_code created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vouchers_institution_id')
BEGIN
    CREATE INDEX IX_vouchers_institution_id ON vouchers(institution_id);
    PRINT 'Index IX_vouchers_institution_id created';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_vouchers_status')
BEGIN
    CREATE INDEX IX_vouchers_status ON vouchers(status);
    PRINT 'Index IX_vouchers_status created';
END

PRINT 'Database schema setup completed successfully!';
