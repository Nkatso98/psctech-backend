-- Simple Diagnostic Script - Check Current Database Schema
-- Run this first to see what we're working with

PRINT '🔍 DIAGNOSING CURRENT DATABASE SCHEMA...';

-- Check what tables exist
PRINT '📋 EXISTING TABLES:';
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Check institutions table structure (if it exists)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'institutions')
BEGIN
    PRINT '🏫 INSTITUTIONS TABLE STRUCTURE:';
    SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'institutions'
    ORDER BY ORDINAL_POSITION;
    
    -- Check if there's any data
    PRINT '📊 INSTITUTIONS TABLE DATA COUNT:';
    SELECT COUNT(*) as TotalRecords FROM institutions;
    
    -- Show sample data if any exists
    IF EXISTS (SELECT TOP 1 * FROM institutions)
    BEGIN
        PRINT '📋 SAMPLE INSTITUTION DATA:';
        SELECT TOP 3 * FROM institutions;
    END
    ELSE
    BEGIN
        PRINT 'ℹ️  No data in institutions table';
    END
END
ELSE
BEGIN
    PRINT '❌ INSTITUTIONS TABLE DOES NOT EXIST';
END

-- Check users table structure (if it exists)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users')
BEGIN
    PRINT '👥 USERS TABLE STRUCTURE:';
    SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users'
    ORDER BY ORDINAL_POSITION;
END
ELSE
BEGIN
    PRINT '❌ USERS TABLE DOES NOT EXIST';
END

PRINT '🎯 DIAGNOSIS COMPLETE - Check the results above';









