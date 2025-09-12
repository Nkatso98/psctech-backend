CREATE VIEW dbo.vw_institutions AS
SELECT 
    CONVERT(varchar(36), id) as id,
    name,
    type,
    principal_name,
    email,
    phone,
    address,
    city,
    state,
    country,
    postal_code,
    website,
    logo_url,
    status,
    created_at,
    updated_at
FROM dbo.institutions;









