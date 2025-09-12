-- Test views existence
SELECT 'vw_study_sessions' as ViewName, 
       CASE WHEN OBJECT_ID('dbo.vw_study_sessions') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as Status
UNION ALL
SELECT 'vw_institutions' as ViewName, 
       CASE WHEN OBJECT_ID('dbo.vw_institutions') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as Status
UNION ALL
SELECT 'vw_vouchers' as ViewName, 
       CASE WHEN OBJECT_ID('dbo.vw_vouchers') IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as Status;









