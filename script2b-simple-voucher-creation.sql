-- =====================================================
-- SCRIPT 2B: CREATE VOUCHER CREATION STORED PROCEDURE
-- =====================================================
-- Run this script in Azure Portal Query Editor

PRINT '=====================================================';
PRINT 'CREATING VOUCHER CREATION STORED PROCEDURE';
PRINT '=====================================================';

-- Create the stored procedure
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

PRINT '✅ Voucher creation stored procedure created successfully!';
PRINT 'Now run Script 2C: Voucher Redemption Procedure';









