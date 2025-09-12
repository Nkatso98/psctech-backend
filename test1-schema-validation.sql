-- Test basic schema validation
SELECT 'StudySessions' as TableName, COUNT(*) as RecordCount FROM dbo.StudySessions
UNION ALL
SELECT 'institutions' as TableName, COUNT(*) as RecordCount FROM dbo.institutions
UNION ALL
SELECT 'vouchers' as TableName, COUNT(*) as RecordCount FROM dbo.vouchers
UNION ALL
SELECT 'voucher_redemptions' as TableName, COUNT(*) as RecordCount FROM dbo.voucher_redemptions
UNION ALL
SELECT 'users' as TableName, COUNT(*) as RecordCount FROM dbo.users;









