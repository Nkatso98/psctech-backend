-- =====================================================
-- SCRIPT 2A: CREATE STUDY SESSION STORED PROCEDURE
-- =====================================================
-- Run this script in Azure Portal Query Editor

PRINT '=====================================================';
PRINT 'CREATING STUDY SESSION STORED PROCEDURE';
PRINT '=====================================================';

-- Drop existing procedure if it exists
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('dbo.sp_create_study_session') AND type in (N'P'))
    DROP PROCEDURE dbo.sp_create_study_session;

-- Create the stored procedure
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

PRINT '✅ Study session stored procedure created successfully!';
PRINT 'Now run Script 2B: Voucher Creation Procedure';









