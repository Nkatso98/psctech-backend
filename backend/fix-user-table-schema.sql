-- Fix User table schema by adding missing password fields
-- This script should be run on the Azure SQL Database

USE [psctech_main];

-- Add PasswordHash column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordHash')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [PasswordHash] NVARCHAR(255) NOT NULL DEFAULT ''
    PRINT 'Added PasswordHash column to Users table'
END
ELSE
BEGIN
    PRINT 'PasswordHash column already exists in Users table'
END

-- Add PasswordResetToken column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordResetToken')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [PasswordResetToken] NVARCHAR(255) NULL
    PRINT 'Added PasswordResetToken column to Users table'
END
ELSE
BEGIN
    PRINT 'PasswordResetToken column already exists in Users table'
END

-- Add PasswordResetTokenExpiry column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'PasswordResetTokenExpiry')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [PasswordResetTokenExpiry] DATETIME2 NULL
    PRINT 'Added PasswordResetTokenExpiry column to Users table'
END
ELSE
BEGIN
    PRINT 'PasswordResetTokenExpiry column already exists in Users table'
END

-- Update existing users with a default password hash if they don't have one
UPDATE [dbo].[Users] 
SET [PasswordHash] = 'default_hash_for_existing_users'
WHERE [PasswordHash] = '' OR [PasswordHash] IS NULL

PRINT 'Database schema fix completed successfully!'









