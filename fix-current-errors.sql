-- =====================================================
-- QUICK FIX FOR CURRENT ERRORS
-- =====================================================
-- Run this first to fix your immediate issues before implementing the full multi-tenant architecture

USE psctech_main;
GO

-- Fix 1: Correct the StartTime column in StudySessions table
-- The current column is NVARCHAR(5) but needs to handle longer time strings
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.StudySessions') AND name = 'StartTime')
BEGIN
    -- Check current data to ensure no truncation
    PRINT 'Current StartTime column data:';
    SELECT DISTINCT StartTime, LEN(StartTime) as Length FROM dbo.StudySessions;
    
    -- Alter the column to allow longer time strings
    ALTER TABLE dbo.StudySessions 
    ALTER COLUMN StartTime NVARCHAR(10) NOT NULL;
    
    PRINT '✅ StartTime column fixed - now supports up to 10 characters';
END
ELSE
BEGIN
    PRINT '⚠️  StudySessions table not found - create it first';
    
    -- Create the table with correct structure if it doesn't exist
    CREATE TABLE dbo.StudySessions (
        Id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_StudySessions PRIMARY KEY DEFAULT NEWID(),
        UserId NVARCHAR(50) NOT NULL,
        InstitutionId NVARCHAR(50) NULL,
        Subject NVARCHAR(100) NOT NULL,
        Topic NVARCHAR(200) NULL,
        DayOfWeek INT NOT NULL,
        StartTime NVARCHAR(10) NOT NULL, -- FIXED: Proper length for time strings
        DurationMinutes INT NOT NULL,
        ReminderMinutesBefore INT NOT NULL DEFAULT(10),
        IsActive BIT NOT NULL DEFAULT(1),
        CreatedAt DATETIME2 NOT NULL DEFAULT(GETUTCDATE()),
        UpdatedAt DATETIME2 NOT NULL DEFAULT(GETUTCDATE())
    );
    
    PRINT '✅ StudySessions table created with correct structure';
END
GO

-- Fix 2: Ensure institutions table has proper CHECK constraints
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.institutions') AND type in (N'U'))
BEGIN
    -- Check if the CHECK constraint exists
    IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_institutions_type')
    BEGIN
        -- Add the CHECK constraint if it doesn't exist
        ALTER TABLE dbo.institutions 
        ADD CONSTRAINT CK_institutions_type 
        CHECK (type IN ('Primary School', 'Secondary School', 'High School', 'University', 'College', 'Vocational School'));
        
        PRINT '✅ CHECK constraint added to institutions.type column';
    END
    ELSE
    BEGIN
        PRINT 'ℹ️  CHECK constraint already exists on institutions.type column';
    END
END
ELSE
BEGIN
    PRINT '⚠️  Institutions table not found - create it first';
    
    -- Create the table with correct structure
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
GO

-- Fix 3: Create proper indexes for performance
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.StudySessions') AND type in (N'U'))
BEGIN
    -- Create indexes if they don't exist
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
END
GO

-- Fix 4: Test the API endpoint with correct data
PRINT '';
PRINT '=====================================================';
PRINT 'CURRENT ERRORS FIXED!';
PRINT '=====================================================';
PRINT '';
PRINT 'Your API should now work with these fixes:';
PRINT '✅ StartTime column supports longer time strings';
PRINT '✅ Institutions table has proper CHECK constraints';
PRINT '✅ Performance indexes are in place';
PRINT '';
PRINT 'Test your API with this sample data:';
PRINT 'POST /api/Study/session';
PRINT '{';
PRINT '  "userId": "test-user-123",';
PRINT '  "institutionId": "test-inst-456",';
PRINT '  "subject": "Mathematics",';
PRINT '  "topic": "Algebra",';
PRINT '  "dayOfWeek": 1,';
PRINT '  "startTime": "14:30",';
PRINT '  "durationMinutes": 60,';
PRINT '  "reminderMinutesBefore": 15';
PRINT '}';
PRINT '';
PRINT 'Next step: Implement the full multi-tenant architecture';
PRINT 'Run: multi-tenant-azure-sql-architecture.sql';

