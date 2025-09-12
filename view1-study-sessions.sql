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









