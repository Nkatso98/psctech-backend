-- Fix Institutions Table - Add Missing Columns for C# Backend
-- This script adds the missing columns that your C# code expects

PRINT '🔧 FIXING INSTITUTIONS TABLE - Adding missing columns...';

-- Add missing columns that the C# backend expects
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('institutions') AND name = 'code')
BEGIN
    ALTER TABLE institutions ADD code NVARCHAR(50) NOT NULL DEFAULT 'INST001';
    PRINT '✅ Added code column with default value';
END
ELSE
BEGIN
    PRINT 'ℹ️  code column already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('institutions') AND name = 'DatabaseName')
BEGIN
    ALTER TABLE institutions ADD DatabaseName NVARCHAR(128) NOT NULL DEFAULT 'psctech_default';
    PRINT '✅ Added DatabaseName column with default value';
END
ELSE
BEGIN
    PRINT 'ℹ️  DatabaseName column already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('institutions') AND name = 'ServerName')
BEGIN
    ALTER TABLE institutions ADD ServerName NVARCHAR(128) NOT NULL DEFAULT 'psctech-sql-server.database.windows.net';
    PRINT '✅ Added ServerName column with default value';
END
ELSE
BEGIN
    PRINT 'ℹ️  ServerName column already exists';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('institutions') AND name = 'IsActive')
BEGIN
    ALTER TABLE institutions ADD IsActive BIT NOT NULL DEFAULT 1;
    PRINT '✅ Added IsActive column with default value';
END
ELSE
BEGIN
    PRINT 'ℹ️  IsActive column already exists';
END

-- Fix the type column constraint to accept the values the C# backend sends
PRINT '🔒 FIXING TYPE COLUMN CONSTRAINT...';

-- Drop existing CHECK constraint if it exists
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name LIKE '%type%')
BEGIN
    DECLARE @constraint_name NVARCHAR(128);
    SELECT @constraint_name = name FROM sys.check_constraints WHERE name LIKE '%type%';
    EXEC('ALTER TABLE institutions DROP CONSTRAINT ' + @constraint_name);
    PRINT '✅ Dropped existing type constraint';
END

-- Add new CHECK constraint with the values the C# backend expects
ALTER TABLE institutions 
ADD CONSTRAINT CK_institutions_type_new 
CHECK (type IN ('Primary School', 'Secondary School', 'University', 'College', 'Technical Institute', 'Vocational School'));
PRINT '✅ Added new CHECK constraint for institution types';

-- Update existing records to have valid types if needed
UPDATE institutions 
SET type = CASE 
    WHEN type = 'primary' THEN 'Primary School'
    WHEN type = 'secondary' THEN 'Secondary School'
    WHEN type = 'combined' THEN 'Secondary School'
    WHEN type = 'high school' THEN 'Secondary School'
    ELSE type
END
WHERE type IN ('primary', 'secondary', 'combined', 'high school');
PRINT '✅ Updated existing institution types to match new constraint';

-- Verify the fixes
PRINT '🔍 VERIFYING THE FIXES...';

-- Show updated table structure
PRINT '📋 UPDATED INSTITUTIONS TABLE STRUCTURE:';
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'institutions'
ORDER BY ORDINAL_POSITION;

-- Test if we can insert the values the C# backend will send
PRINT '🧪 TESTING INSERT WITH C# BACKEND VALUES...';
BEGIN TRY
    INSERT INTO institutions (name, type, email, phone, address, code, DatabaseName, ServerName, IsActive)
    VALUES ('Test School', 'Secondary School', 'test@school.com', '1234567890', 'Test Address', 'TEST001', 'test_db', 'test_server', 1);
    
    PRINT '✅ Test insert successful - schema is fixed!';
    
    -- Clean up test data
    DELETE FROM institutions WHERE email = 'test@school.com';
    PRINT '✅ Test data cleaned up';
END TRY
BEGIN CATCH
    PRINT '❌ Test insert failed: ' + ERROR_MESSAGE();
END CATCH

PRINT '🎉 INSTITUTIONS TABLE FIX COMPLETED!';
PRINT '🚀 Your C# backend should now work without 500 errors!';









