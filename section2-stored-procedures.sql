-- =====================================================
-- SECTION 2: CREATE STORED PROCEDURES
-- =====================================================
-- Run this section SECOND in Azure Portal Query Editor

PRINT '=====================================================';
PRINT 'STARTING SECTION 2: STORED PROCEDURES';
PRINT '=====================================================';

-- Stored procedure for creating study sessions
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.sp_create_study_session') AND type in (N'P'))
    DROP PROCEDURE dbo.sp_create_study_session;

CREATE PROCEDURE dbo.sp_create_study_session
    @userId NVARCHAR(50),
    @institutionId NVARCHAR(50),
    @subject NVARCHAR(100),
    @topic NVARCHAR(200),
    @dayOfWeek INT,
    @startTime NVARCHAR(10),
    @durationMinutes INT,
    @reminderMinutesBefore INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate input parameters
        IF @userId IS NULL OR @userId = '' OR @subject IS NULL OR @subject = ''
        BEGIN
            RAISERROR ('UserId and Subject are required', 16, 1);
            RETURN;
        END
        
        IF @dayOfWeek < 0 OR @dayOfWeek > 6
        BEGIN
            RAISERROR ('DayOfWeek must be between 0 and 6', 16, 1);
            RETURN;
        END
        
        IF @durationMinutes <= 0
        BEGIN
            RAISERROR ('DurationMinutes must be greater than 0', 16, 1);
            RETURN;
        END
        
        -- Insert the study session
        INSERT INTO dbo.StudySessions(UserId, InstitutionId, Subject, Topic, DayOfWeek, StartTime, DurationMinutes, ReminderMinutesBefore, IsActive)
        VALUES (@userId, @institutionId, @subject, @topic, @dayOfWeek, @startTime, @durationMinutes, @reminderMinutesBefore, 1);
        
        -- Return the created session
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
        FROM dbo.StudySessions 
        WHERE Id = SCOPE_IDENTITY();
        
        PRINT 'Study session created successfully';
        
    END TRY
    BEGIN CATCH
        DECLARE @StudySessionErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@StudySessionErrorMessage, 16, 1);
    END CATCH
END;

PRINT '✅ Study session stored procedure created';

-- Stored procedure for creating vouchers
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.sp_create_voucher') AND type in (N'P'))
    DROP PROCEDURE dbo.sp_create_voucher;

CREATE PROCEDURE dbo.sp_create_voucher
    @denomination DECIMAL(10,2),
    @parentGuardianName NVARCHAR(255),
    @learnerCount INT,
    @institutionId NVARCHAR(50),
    @issuedByUserId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate input parameters
        IF @denomination <= 0
        BEGIN
            RAISERROR ('Denomination must be greater than 0', 16, 1);
            RETURN;
        END
        
        IF @parentGuardianName IS NULL OR @parentGuardianName = ''
        BEGIN
            RAISERROR ('ParentGuardianName is required', 16, 1);
            RETURN;
        END
        
        IF @learnerCount <= 0
        BEGIN
            RAISERROR ('LearnerCount must be greater than 0', 16, 1);
            RETURN;
        END
        
        IF @institutionId IS NULL OR @institutionId = ''
        BEGIN
            RAISERROR ('InstitutionId is required', 16, 1);
            RETURN;
        END
        
        IF @issuedByUserId IS NULL OR @issuedByUserId = ''
        BEGIN
            RAISERROR ('IssuedByUserId is required', 16, 1);
            RETURN;
        END
        
        -- Generate unique voucher code
        DECLARE @VoucherCodeValue NVARCHAR(50) = 'VOUCHER-' + CAST(NEWID() AS NVARCHAR(36));
        
        -- Insert the voucher
        INSERT INTO dbo.vouchers(voucher_code, denomination, parent_guardian_name, learner_count, institution_id, issued_by_user_id, expires_at)
        VALUES (@VoucherCodeValue, @denomination, @parentGuardianName, @learnerCount, @institutionId, @issuedByUserId, DATEADD(month, 12, GETUTCDATE()));
        
        -- Return the created voucher
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
            expires_at
        FROM dbo.vouchers 
        WHERE id = SCOPE_IDENTITY();
        
        PRINT 'Voucher created successfully';
        
    END TRY
    BEGIN CATCH
        DECLARE @VoucherErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@VoucherErrorMessage, 16, 1);
    END CATCH
END;

PRINT '✅ Voucher creation stored procedure created';

-- Stored procedure for redeeming vouchers
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.sp_redeem_voucher') AND type in (N'P'))
    DROP PROCEDURE dbo.sp_redeem_voucher;

CREATE PROCEDURE dbo.sp_redeem_voucher
    @voucherCode NVARCHAR(50),
    @userId NVARCHAR(50),
    @parentGuardianName NVARCHAR(255),
    @learnerCount INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate input parameters
        IF @voucherCode IS NULL OR @voucherCode = ''
        BEGIN
            RAISERROR ('VoucherCode is required', 16, 1);
            RETURN;
        END
        
        IF @userId IS NULL OR @userId = ''
        BEGIN
            RAISERROR ('UserId is required', 16, 1);
            RETURN;
        END
        
        IF @parentGuardianName IS NULL OR @parentGuardianName = ''
        BEGIN
            RAISERROR ('ParentGuardianName is required', 16, 1);
            RETURN;
        END
        
        IF @learnerCount <= 0
        BEGIN
            RAISERROR ('LearnerCount must be greater than 0', 16, 1);
            RETURN;
        END
        
        -- Check if voucher exists and is valid
        DECLARE @VoucherIdValue UNIQUEIDENTIFIER;
        DECLARE @VoucherStatusValue NVARCHAR(20);
        DECLARE @VoucherDenominationValue DECIMAL(10,2);
        
        SELECT @VoucherIdValue = id, @VoucherStatusValue = status, @VoucherDenominationValue = denomination
        FROM dbo.vouchers 
        WHERE voucher_code = @voucherCode;
        
        IF @VoucherIdValue IS NULL
        BEGIN
            RAISERROR ('Voucher not found', 16, 1);
            RETURN;
        END
        
        IF @VoucherStatusValue != 'Active'
        BEGIN
            RAISERROR ('Voucher is not active', 16, 1);
            RETURN;
        END
        
        -- Begin transaction
        BEGIN TRANSACTION;
        
        -- Update voucher status
        UPDATE dbo.vouchers 
        SET status = 'Redeemed', 
            redeemed_at = GETUTCDATE(),
            updated_at = GETUTCDATE()
        WHERE id = @VoucherIdValue;
        
        -- Create redemption record
        INSERT INTO dbo.voucher_redemptions(voucher_id, voucher_code, user_id, parent_guardian_name, learner_count)
        VALUES (@VoucherIdValue, @voucherCode, @userId, @parentGuardianName, @learnerCount);
        
        COMMIT TRANSACTION;
        
        -- Return redemption details
        SELECT 
            CONVERT(varchar(36), vr.id) as redemption_id,
            vr.voucher_code,
            vr.user_id,
            vr.parent_guardian_name,
            vr.learner_count,
            v.denomination,
            vr.redeemed_at
        FROM dbo.voucher_redemptions vr
        INNER JOIN dbo.vouchers v ON vr.voucher_id = v.id
        WHERE vr.id = SCOPE_IDENTITY();
        
        PRINT 'Voucher redeemed successfully';
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DECLARE @RedeemErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR (@RedeemErrorMessage, 16, 1);
    END CATCH
END;

PRINT '✅ Voucher redemption stored procedure created';

PRINT '=====================================================';
PRINT 'SECTION 2 COMPLETE: STORED PROCEDURES CREATED';
PRINT '=====================================================';
PRINT 'Now run Section 3: Views';









