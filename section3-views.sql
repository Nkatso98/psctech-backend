-- =====================================================
-- SECTION 3: CREATE VIEWS
-- =====================================================
-- Run this section THIRD in Azure Portal Query Editor

PRINT '=====================================================';
PRINT 'STARTING SECTION 3: VIEWS';
PRINT '=====================================================';

-- View for study sessions
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('dbo.vw_study_sessions'))
    DROP VIEW dbo.vw_study_sessions;

CREATE VIEW dbo.vw_study_sessions AS
SELECT 
    CONVERT(varchar(36), Id) as Id,
    UserId,
    InstitutionId,
    Subject,
    Topic,
    DayOfWeek,
    StartTime,
    DurationMinutes,
    ReminderMinutesBefore,
    IsActive
FROM dbo.StudySessions;

PRINT '✅ Study sessions view created';

-- View for institutions
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('dbo.vw_institutions'))
    DROP VIEW dbo.vw_institutions;

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

PRINT '✅ Institutions view created';

-- View for vouchers
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID('dbo.vw_vouchers'))
    DROP VIEW dbo.vw_vouchers;

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

PRINT '✅ Vouchers view created';

PRINT '=====================================================';
PRINT 'SECTION 3 COMPLETE: VIEWS CREATED';
PRINT '=====================================================';
PRINT 'Now run Section 4: Testing and Validation';









