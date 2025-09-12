-- =====================================================
-- SECTION 1: CREATE TABLES AND INDEXES
-- =====================================================
-- Run this section FIRST in Azure Portal Query Editor

PRINT '=====================================================';
PRINT 'STARTING SECTION 1: TABLES AND INDEXES';
PRINT '=====================================================';

-- Fix 1: Correct StudySessions table structure
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.StudySessions') AND type in (N'U'))
BEGIN
    PRINT 'Fixing StudySessions table...';
    
    -- Check current StartTime column
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.StudySessions') AND name = 'StartTime')
    BEGIN
        -- Alter StartTime to proper length
        ALTER TABLE dbo.StudySessions 
        ALTER COLUMN StartTime NVARCHAR(10) NOT NULL;
        PRINT '✅ StartTime column fixed - now supports up to 10 characters';
    END
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.StudySessions') AND name = 'CreatedAt')
    BEGIN
        ALTER TABLE dbo.StudySessions ADD CreatedAt DATETIME2 DEFAULT GETUTCDATE();
        PRINT '✅ CreatedAt column added';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.StudySessions') AND name = 'UpdatedAt')
    BEGIN
        ALTER TABLE dbo.StudySessions ADD UpdatedAt DATETIME2 DEFAULT GETUTCDATE();
        PRINT '✅ UpdatedAt column added';
    END
END
ELSE
BEGIN
    PRINT 'Creating StudySessions table with correct structure...';
    CREATE TABLE dbo.StudySessions (
        Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_StudySessions PRIMARY KEY DEFAULT NEWID(),
        UserId NVARCHAR(50) NOT NULL,
        InstitutionId NVARCHAR(50) NULL,
        Subject NVARCHAR(100) NOT NULL,
        Topic NVARCHAR(200) NULL,
        DayOfWeek INT NOT NULL,
        StartTime NVARCHAR(10) NOT NULL,
        DurationMinutes INT NOT NULL,
        ReminderMinutesBefore INT NOT NULL DEFAULT(10),
        IsActive BIT NOT NULL DEFAULT(1),
        CreatedAt DATETIME2 NOT NULL DEFAULT(GETUTCDATE()),
        UpdatedAt DATETIME2 NOT NULL DEFAULT(GETUTCDATE())
    );
    PRINT '✅ StudySessions table created with correct structure';
END

-- Fix 2: Ensure institutions table has proper structure
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.institutions') AND type in (N'U'))
BEGIN
    PRINT 'Fixing institutions table...';
    
    -- Add CHECK constraint if it doesn't exist
    IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_institutions_type')
    BEGIN
        ALTER TABLE dbo.institutions 
        ADD CONSTRAINT CK_institutions_type 
        CHECK (type IN ('Primary School', 'Secondary School', 'High School', 'University', 'College', 'Vocational School'));
        PRINT '✅ CHECK constraint added to institutions.type column';
    END
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.institutions') AND name = 'created_at')
    BEGIN
        ALTER TABLE dbo.institutions ADD created_at DATETIME2 DEFAULT GETUTCDATE();
        PRINT '✅ created_at column added';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.institutions') AND name = 'updated_at')
    BEGIN
        ALTER TABLE dbo.institutions ADD updated_at DATETIME2 DEFAULT GETUTCDATE();
        PRINT '✅ updated_at column added';
    END
END
ELSE
BEGIN
    PRINT 'Creating institutions table with correct structure...';
    CREATE TABLE dbo.institutions (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        type NVARCHAR(50) NOT NULL CHECK (type IN ('Primary School', 'Secondary School', 'High School', 'University', 'College', 'Vocational School')),
        principal_name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        phone NVARCHAR(20),
        address NVARCHAR(500),
        city NVARCHAR(100),
        state NVARCHAR(100),
        country NVARCHAR(100) DEFAULT 'Nigeria',
        postal_code NVARCHAR(20),
        website NVARCHAR(255),
        logo_url NVARCHAR(500),
        status NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Pending')),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT '✅ Institutions table created with correct structure';
END

-- Fix 3: Create Vouchers table for voucher system
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.vouchers') AND type in (N'U'))
BEGIN
    PRINT 'Creating vouchers table...';
    CREATE TABLE dbo.vouchers (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        voucher_code NVARCHAR(50) NOT NULL UNIQUE,
        denomination DECIMAL(10,2) NOT NULL,
        parent_guardian_name NVARCHAR(255) NOT NULL,
        learner_count INT NOT NULL DEFAULT 1,
        institution_id NVARCHAR(50) NOT NULL,
        issued_by_user_id NVARCHAR(50) NOT NULL,
        status NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Redeemed', 'Expired', 'Cancelled')),
        issued_at DATETIME2 DEFAULT GETUTCDATE(),
        redeemed_at DATETIME2 NULL,
        expires_at DATETIME2 NULL,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT '✅ Vouchers table created';
END

-- Fix 4: Create VoucherRedemptions table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.voucher_redemptions') AND type in (N'U'))
BEGIN
    PRINT 'Creating voucher_redemptions table...';
    CREATE TABLE dbo.voucher_redemptions (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        voucher_id UNIQUEIDENTIFIER NOT NULL,
        voucher_code NVARCHAR(50) NOT NULL,
        user_id NVARCHAR(50) NOT NULL,
        parent_guardian_name NVARCHAR(255) NOT NULL,
        learner_count INT NOT NULL DEFAULT 1,
        redeemed_at DATETIME2 DEFAULT GETUTCDATE(),
        institution_id NVARCHAR(50) NULL,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_voucher_redemptions_voucher FOREIGN KEY (voucher_id) REFERENCES dbo.vouchers(id)
    );
    PRINT '✅ VoucherRedemptions table created';
END

-- Fix 5: Create Users table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.users') AND type in (N'U'))
BEGIN
    PRINT 'Creating users table...';
    CREATE TABLE dbo.users (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        institution_id NVARCHAR(50) NULL,
        username NVARCHAR(100) NOT NULL,
        email NVARCHAR(255) NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        role NVARCHAR(50) NOT NULL CHECK (role IN ('Principal', 'Teacher', 'Student', 'Admin', 'Parent')),
        status NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
        last_login DATETIME2 NULL,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT '✅ Users table created';
END

-- Create performance indexes
PRINT 'Creating performance indexes...';

-- StudySessions indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.StudySessions') AND name = 'IX_StudySessions_UserId')
BEGIN
    CREATE INDEX IX_StudySessions_UserId ON dbo.StudySessions(UserId);
    PRINT '✅ Index created on StudySessions.UserId';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.StudySessions') AND name = 'IX_StudySessions_InstitutionId')
BEGIN
    CREATE INDEX IX_StudySessions_InstitutionId ON dbo.StudySessions(InstitutionId);
    PRINT '✅ Index created on StudySessions.InstitutionId';
END

-- Institutions indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.institutions') AND name = 'IX_institutions_type')
BEGIN
    CREATE INDEX IX_institutions_type ON dbo.institutions(type);
    PRINT '✅ Index created on institutions.type';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.institutions') AND name = 'IX_institutions_email')
BEGIN
    CREATE INDEX IX_institutions_email ON dbo.institutions(email);
    PRINT '✅ Index created on institutions.email';
END

-- Vouchers indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.vouchers') AND name = 'IX_vouchers_code')
BEGIN
    CREATE INDEX IX_vouchers_code ON dbo.vouchers(voucher_code);
    PRINT '✅ Index created on vouchers.voucher_code';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.vouchers') AND name = 'IX_vouchers_institution')
BEGIN
    CREATE INDEX IX_vouchers_institution ON dbo.vouchers(institution_id);
    PRINT '✅ Index created on vouchers.institution_id';
END

-- Users indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.users') AND name = 'IX_users_institution')
BEGIN
    CREATE INDEX IX_users_institution ON dbo.users(institution_id);
    PRINT '✅ Index created on users.institution_id';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.users') AND name = 'IX_users_email')
BEGIN
    CREATE INDEX IX_users_email ON dbo.users(email);
    PRINT '✅ Index created on users.email';
END

PRINT '=====================================================';
PRINT 'SECTION 1 COMPLETE: TABLES AND INDEXES CREATED';
PRINT '=====================================================';
PRINT 'Now run Section 2: Stored Procedures';









