-- Check current database schema for PSC Tech
-- Run this on your Azure SQL database to see what tables and columns exist

-- Check if tables exist
SELECT 
    t.name AS TableName,
    s.name AS SchemaName
FROM sys.tables t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.name IN ('institutions', 'users', 'students', 'teachers', 'vouchers')
ORDER BY t.name;

-- Check Institutions table structure
IF OBJECT_ID('institutions') IS NOT NULL
BEGIN
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length,
        c.is_nullable,
        c.is_identity
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('institutions')
    ORDER BY c.column_id;
END
ELSE
BEGIN
    PRINT 'Institutions table does not exist';
END

-- Check Users table structure
IF OBJECT_ID('users') IS NOT NULL
BEGIN
    SELECT 
        c.name AS ColumnName,
        t.name AS DataType,
        c.max_length,
        c.is_nullable,
        c.is_identity
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('users')
    ORDER BY c.column_id;
END
ELSE
BEGIN
    PRINT 'Users table does not exist';
END

-- Check if we can connect and see basic info
SELECT 
    DB_NAME() AS DatabaseName,
    @@VERSION AS SQLServerVersion,
    GETDATE() AS CurrentTime;
