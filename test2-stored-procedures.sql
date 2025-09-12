-- Test stored procedure existence
SELECT 'sp_create_study_session' as ProcedureName, 
       CASE WHEN OBJECT_ID('dbo.sp_create_study_session') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as Status
UNION ALL
SELECT 'sp_create_voucher' as ProcedureName, 
       CASE WHEN OBJECT_ID('dbo.sp_create_voucher') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as Status
UNION ALL
SELECT 'sp_redeem_voucher' as ProcedureName, 
       CASE WHEN OBJECT_ID('dbo.sp_redeem_voucher') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as Status;









