using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace PSC.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudyController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTOs with proper validation
        public class CreateSessionRequest
        {
            [Required(ErrorMessage = "User ID is required")]
            [StringLength(50, ErrorMessage = "User ID cannot exceed 50 characters")]
            public string UserId { get; set; }

            [StringLength(50, ErrorMessage = "Institution ID cannot exceed 50 characters")]
            public string InstitutionId { get; set; }

            [Required(ErrorMessage = "Subject is required")]
            [StringLength(100, ErrorMessage = "Subject cannot exceed 100 characters")]
            public string Subject { get; set; }

            [StringLength(200, ErrorMessage = "Topic cannot exceed 200 characters")]
            public string Topic { get; set; }

            [Required(ErrorMessage = "Day of week is required")]
            [Range(0, 6, ErrorMessage = "Day of week must be between 0 (Sunday) and 6 (Saturday)")]
            public int DayOfWeek { get; set; }

            [Required(ErrorMessage = "Start time is required")]
            [StringLength(10, ErrorMessage = "Start time cannot exceed 10 characters")]
            [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Start time must be in HH:MM format")]
            public string StartTime { get; set; }

            [Required(ErrorMessage = "Duration is required")]
            [Range(1, 1440, ErrorMessage = "Duration must be between 1 and 1440 minutes")]
            public int DurationMinutes { get; set; }

            [Range(0, 1440, ErrorMessage = "Reminder must be between 0 and 1440 minutes")]
            public int ReminderMinutesBefore { get; set; }
        }

        public class StudySessionResponse
        {
            public string Id { get; set; }
            public string UserId { get; set; }
            public string InstitutionId { get; set; }
            public string Subject { get; set; }
            public string Topic { get; set; }
            public int DayOfWeek { get; set; }
            public string StartTime { get; set; }
            public int DurationMinutes { get; set; }
            public int ReminderMinutesBefore { get; set; }
            public bool IsActive { get; set; }
        }

        [HttpPost("session")]
        public async Task<ActionResult<ApiResponse<StudySessionResponse>>> CreateSession([FromBody] CreateSessionRequest request)
        {
            try
            {
                // Validate start time format
                if (!TimeSpan.TryParse(request.StartTime, out _))
                {
                    return BadRequest(new ApiResponse<StudySessionResponse>
                    {
                        Success = false,
                        Message = "Invalid start time format. Use HH:MM format (e.g., 14:30)",
                        Data = null
                    });
                }

                // Validate start time length (should be 5 characters like "14:30")
                if (request.StartTime.Length > 5)
                {
                    return BadRequest(new ApiResponse<StudySessionResponse>
                    {
                        Success = false,
                        Message = "Start time too long. Use HH:MM format (e.g., 14:30)",
                        Data = null
                    });
                }

                // Use stored procedure for better performance and validation
                var result = await _context.Database.SqlQueryRaw<StudySessionResponse>(
                    "EXEC dbo.sp_create_study_session @p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7",
                    request.UserId,
                    request.InstitutionId ?? (object)DBNull.Value,
                    request.Subject,
                    request.Topic ?? (object)DBNull.Value,
                    request.DayOfWeek,
                    request.StartTime,
                    request.DurationMinutes,
                    request.ReminderMinutesBefore
                ).FirstOrDefaultAsync();

                if (result == null)
                {
                    return BadRequest(new ApiResponse<StudySessionResponse>
                    {
                        Success = false,
                        Message = "Failed to create study session",
                        Data = null
                    });
                }

                return Ok(new ApiResponse<StudySessionResponse>
                {
                    Success = true,
                    Message = "Study session created successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<StudySessionResponse>
                {
                    Success = false,
                    Message = "An error occurred while creating the study session",
                    Data = null,
                    Error = ex.Message
                });
            }
        }

        [HttpGet("session/user/{userId}")]
        public async Task<ActionResult<ApiResponse<List<StudySessionResponse>>>> GetUserSessions(string userId)
        {
            try
            {
                var sessions = await _context.StudySessions
                    .Where(s => s.UserId == userId && s.IsActive)
                    .Select(s => new StudySessionResponse
                    {
                        Id = s.Id.ToString(),
                        UserId = s.UserId,
                        InstitutionId = s.InstitutionId,
                        Subject = s.Subject,
                        Topic = s.Topic,
                        DayOfWeek = s.DayOfWeek,
                        StartTime = s.StartTime,
                        DurationMinutes = s.DurationMinutes,
                        ReminderMinutesBefore = s.ReminderMinutesBefore,
                        IsActive = s.IsActive
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<List<StudySessionResponse>>
                {
                    Success = true,
                    Message = "User sessions retrieved successfully",
                    Data = sessions
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<StudySessionResponse>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving user sessions",
                    Data = null,
                    Error = ex.Message
                });
            }
        }
    }

    // Helper classes
    public class StudySession
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string InstitutionId { get; set; }
        public string Subject { get; set; }
        public string Topic { get; set; }
        public int DayOfWeek { get; set; }
        public string StartTime { get; set; }
        public int DurationMinutes { get; set; }
        public int ReminderMinutesBefore { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public string Error { get; set; }
    }
}









