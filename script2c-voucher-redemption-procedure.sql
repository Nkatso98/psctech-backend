-- =====================================================
-- SCRIPT 2C: CREATE VOUCHER REDEMPTION STORED PROCEDURE
-- =====================================================
-- Run this script in Azure Portal Query Editor

PRINT '=====================================================';
PRINT 'CREATING VOUCHER REDEMPTION STORED PROCEDURE';
PRINT '=====================================================';

-- Drop existing procedure if it exists
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.sp_redeem_voucher') AND type in (N'P'))
    DROP PROCEDURE dbo.sp_redeem_voucher;

-- Create the stored procedure
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

PRINT '✅ Voucher redemption stored procedure created successfully!';
PRINT 'All stored procedures completed! Now run Section 3: Views';









