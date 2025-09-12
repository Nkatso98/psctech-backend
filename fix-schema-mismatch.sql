-- Fix Database Schema Mismatch - PSC Tech Backend
-- This script aligns the database schema with the C# backend models
-- Run this on your psctech_main database

USE [psctech_main];
GO

PRINT '🔧 Fixing database schema to match C# backend models...';
GO

-- =====================================================
-- FIX INSTITUTIONS TABLE TO MATCH C# MODELS
-- =====================================================

-- First, let's see what we currently have
PRINT 'Current institutions table structure:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'institutions'
ORDER BY ORDINAL_POSITION;
GO

-- Fix the type column to accept the values the C# backend sends
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.institutions') AND type in (N'U'))
BEGIN
    PRINT 'Fixing institutions table...';
    
    -- Drop existing CHECK constraint if it exists
    IF EXISTS (SELECT * FROM sys.check_constraints WHERE name LIKE '%type%')
    BEGIN
        DECLARE @constraint_name NVARCHAR(128);
        SELECT @constraint_name = name FROM sys.check_constraints WHERE name LIKE '%type%';
        EXEC('ALTER TABLE dbo.institutions DROP CONSTRAINT ' + @constraint_name);
        PRINT '✅ Dropped existing type constraint';
    END
    
    -- Update the type column to accept the values the C# backend sends
    ALTER TABLE dbo.institutions 
    ALTER COLUMN type NVARCHAR(50) NOT NULL;
    PRINT '✅ Updated type column to NVARCHAR(50)';
    
    -- Add new CHECK constraint with the values the C# backend expects
    ALTER TABLE dbo.institutions 
    ADD CONSTRAINT CK_institutions_type_new 
    CHECK (type IN ('Primary School', 'Secondary School', 'University', 'College', 'Technical Institute', 'Vocational School'));
    PRINT '✅ Added new CHECK constraint for institution types';
    
    -- Add missing columns that the C# backend expects
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.institutions') AND name = 'DatabaseName')
    BEGIN
        ALTER TABLE dbo.institutions ADD DatabaseName NVARCHAR(128) NOT NULL DEFAULT 'psctech_default';
        PRINT '✅ Added DatabaseName column';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.institutions') AND name = 'ServerName')
    BEGIN
        ALTER TABLE dbo.institutions ADD ServerName NVARCHAR(128) NOT NULL DEFAULT 'psctech-sql-server.database.windows.net';
        PRINT '✅ Added ServerName column';
    END
    
    -- Update existing records to have valid types
    UPDATE dbo.institutions 
    SET type = CASE 
        WHEN type = 'primary' THEN 'Primary School'
        WHEN type = 'secondary' THEN 'Secondary School'
        WHEN type = 'combined' THEN 'Secondary School'
        ELSE 'Primary School'
    END
    WHERE type IN ('primary', 'secondary', 'combined');
    PRINT '✅ Updated existing institution types to match new constraint';
END
ELSE
BEGIN
    PRINT '⚠️  Institutions table not found - creating it with correct structure';
    
    CREATE TABLE dbo.institutions (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        type NVARCHAR(50) NOT NULL CHECK (type IN ('Primary School', 'Secondary School', 'University', 'College', 'Technical Institute', 'Vocational School')),
        email NVARCHAR(255) NOT NULL UNIQUE,
        phone NVARCHAR(20) NULL,
        address NVARCHAR(500) NULL,
        district NVARCHAR(100) NULL,
        province NVARCHAR(100) NULL,
        country NVARCHAR(100) DEFAULT 'South Africa',
        website NVARCHAR(255) NULL,
        logo_url NVARCHAR(500) NULL,
        subscription_plan NVARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
        subscription_status NVARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'suspended')),
        subscription_expiry DATE NULL,
        max_users INT DEFAULT 100,
        max_students INT DEFAULT 1000,
        code NVARCHAR(50) NOT NULL UNIQUE,
        DatabaseName NVARCHAR(128) NOT NULL DEFAULT 'psctech_default',
        ServerName NVARCHAR(128) NOT NULL DEFAULT 'psctech-sql-server.database.windows.net',
        connection_string NVARCHAR(MAX) NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT '✅ Created institutions table with correct structure';
END
GO

-- =====================================================
-- FIX USERS TABLE TO MATCH C# MODELS
-- =====================================================

-- Check if users table exists and has the right structure
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.users') AND type in (N'U'))
BEGIN
    PRINT 'Fixing users table...';
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'created_at')
    BEGIN
        ALTER TABLE dbo.users ADD created_at DATETIME2 DEFAULT GETUTCDATE();
        PRINT '✅ Added created_at column to users';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'updated_at')
    BEGIN
        ALTER TABLE dbo.users ADD updated_at DATETIME2 DEFAULT GETUTCDATE();
        PRINT '✅ Added updated_at column to users';
    END
END
ELSE
BEGIN
    PRINT '⚠️  Users table not found - creating it with correct structure';
    
    CREATE TABLE dbo.users (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        username NVARCHAR(100) NOT NULL UNIQUE,
        email NVARCHAR(255) NOT NULL UNIQUE,
        role NVARCHAR(20) NOT NULL CHECK (role IN ('principal', 'teacher', 'parent', 'learner', 'sgb')),
        institution_id UNIQUEIDENTIFIER NOT NULL,
        is_active BIT DEFAULT 1,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_users_institution FOREIGN KEY (institution_id) REFERENCES dbo.institutions(id)
    );
    PRINT '✅ Created users table with correct structure';
END
GO

-- =====================================================
-- CREATE USER PROFILES TABLE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.user_profiles') AND type in (N'U'))
BEGIN
    PRINT 'Creating user_profiles table...';
    
    CREATE TABLE dbo.user_profiles (
        id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        user_id UNIQUEIDENTIFIER NOT NULL,
        first_name NVARCHAR(100) NOT NULL,
        last_name NVARCHAR(100) NOT NULL,
        phone NVARCHAR(20) NULL,
        address NVARCHAR(500) NULL,
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_user_profiles_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)
    );
    PRINT '✅ Created user_profiles table';
END
ELSE
BEGIN
    PRINT 'ℹ️  user_profiles table already exists';
END
GO

-- =====================================================
-- VERIFY THE FIXES
-- =====================================================

PRINT '🔍 Verifying the fixes...';

-- Check institutions table structure
PRINT 'Institutions table structure:';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'institutions'
ORDER BY ORDINAL_POSITION;

-- Check the CHECK constraint
PRINT 'Type CHECK constraint:';
SELECT cc.name, cc.definition
FROM sys.check_constraints cc
WHERE cc.name LIKE '%type%';

-- Check if we can insert the values the C# backend will send
PRINT 'Testing insert with C# backend values...';
BEGIN TRY
    INSERT INTO dbo.institutions (name, type, email, phone, address, code, DatabaseName, ServerName)
    VALUES ('Test School', 'Secondary School', 'test@school.com', '1234567890', 'Test Address', 'TEST001', 'test_db', 'test_server');
    
    PRINT '✅ Test insert successful - schema is fixed!';
    
    -- Clean up test data
    DELETE FROM dbo.institutions WHERE email = 'test@school.com';
    PRINT '✅ Test data cleaned up';
END TRY
BEGIN CATCH
    PRINT '❌ Test insert failed: ' + ERROR_MESSAGE();
END CATCH

PRINT '🎉 Schema fix completed!';
GO









