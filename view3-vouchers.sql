CREATE VIEW dbo.vw_vouchers AS
SELECT 
    CONVERT(varchar(36), id) as id,
    voucher_code,
    denomination,
    parent_guardian_name,
    learner_count,
    institution_id,
    issued_by_user_id,
    status,
    issued_at,
    redeemed_at,
    expires_at,
    created_at,
    updated_at
FROM dbo.vouchers;









