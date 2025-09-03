using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using PscTechBackend.Models;
using PscTechBackend.Data;

namespace PscTechBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstitutionController : ControllerBase
    {
        private readonly PscTechDbContext _context;

        public InstitutionController(PscTechDbContext context)
        {
            _context = context;
        }

        // DTOs with proper validation - making most fields optional
        public class InstitutionRegistrationRequest
        {
            [JsonPropertyName("schoolName")]
            [StringLength(255, ErrorMessage = "School name cannot exceed 255 characters")]
            public string? SchoolName { get; set; }

            [JsonPropertyName("principalName")]
            [StringLength(255, ErrorMessage = "Principal name cannot exceed 255 characters")]
            public string? PrincipalName { get; set; }

            [JsonPropertyName("email")]
            [EmailAddress(ErrorMessage = "Invalid email format")]
            [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
            public string? Email { get; set; }

            [JsonPropertyName("phone")]
            [StringLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
            public string? Phone { get; set; }

            [JsonPropertyName("address")]
            [StringLength(500, ErrorMessage = "Address cannot exceed 500 characters")]
            public string? Address { get; set; }

            [JsonPropertyName("schoolType")]
            [Required(ErrorMessage = "School type is required")]
            [RegularExpression("^(Primary School|Secondary School|Combined School|University|College|Technical Institute|Vocational School)$", 
                ErrorMessage = "School type must be: Primary School, Secondary School, Combined School, University, College, Technical Institute, or Vocational School")]
            public string SchoolType { get; set; }

            [JsonPropertyName("username")]
            [Required(ErrorMessage = "Username is required")]
            [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters")]
            public string Username { get; set; }

            [JsonPropertyName("password")]
            [Required(ErrorMessage = "Password is required")]
            [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be between 6 and 100 characters")]
            public string Password { get; set; }
        }

        public class InstitutionResponse
        {
            public Guid Id { get; set; }
            public string Name { get; set; }
            public string Type { get; set; }
            public string PrincipalName { get; set; }
            public string Email { get; set; }
            public string Phone { get; set; }
            public string Address { get; set; }
            public string Status { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        [HttpPost("test")]
        public ActionResult<object> TestEndpoint([FromBody] object request)
        {
            return Ok(new { 
                message = "Test endpoint working", 
                receivedData = request,
                timestamp = DateTime.UtcNow
            });
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<InstitutionResponse>>> Register([FromBody] InstitutionRegistrationRequest request)
        {
            try
            {
                // Log the incoming request for debugging
                Console.WriteLine($"Received registration request: {System.Text.Json.JsonSerializer.Serialize(request)}");

                // Check if request is null
                if (request == null)
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = "Request body is null or invalid",
                        Data = null
                    });
                }

                // Validate school type against allowed values
                var allowedTypes = new[] { "Primary School", "Secondary School", "Combined School", "University", "College", "Technical Institute", "Vocational School" };
                if (string.IsNullOrEmpty(request.SchoolType))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = "School type is required",
                        Data = null
                    });
                }

                if (!allowedTypes.Contains(request.SchoolType))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = $"Invalid school type '{request.SchoolType}'. Must be one of: {string.Join(", ", allowedTypes)}",
                        Data = null
                    });
                }

                // Validate required fields
                if (string.IsNullOrEmpty(request.Username))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = "Username is required",
                        Data = null
                    });
                }

                if (string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = "Password is required",
                        Data = null
                    });
                }

                // Check if email already exists (use username as email if email is missing)
                var emailToUse = request.Email ?? request.Username;
                if (await _context.Institutions.AnyAsync(i => i.Email == emailToUse))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = $"An institution with email '{emailToUse}' already exists",
                        Data = null
                    });
                }

                // Check if username already exists
                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = $"Username '{request.Username}' is already taken",
                        Data = null
                    });
                }

                // Create institution with defaults for missing fields
                var institution = new Institution
                {
                    Id = Guid.NewGuid(),
                    Name = request.SchoolName ?? $"School {request.SchoolType}",
                    Type = request.SchoolType, // This now matches the CHECK constraint
                    Email = emailToUse,
                    Phone = request.Phone ?? "Not provided",
                    Address = request.Address ?? "Not provided",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Code = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                    DatabaseName = $"psctech_{Guid.NewGuid().ToString().Replace("-", "").Substring(0, 8)}",
                    ServerName = "psctech-sql-server.database.windows.net"
                };

                _context.Institutions.Add(institution);

                // Hash the password
                var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // Create user account
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    InstitutionId = institution.Id,
                    Username = request.Username,
                    Email = emailToUse,
                    PasswordHash = passwordHash,
                    Role = "principal",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);

                // Create user profile for additional data
                var userProfile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FirstName = request.PrincipalName?.Split(' ')[0] ?? "Principal",
                    LastName = request.PrincipalName?.Split(' ').Length > 1 ? string.Join(" ", request.PrincipalName.Split(' ').Skip(1)) : request.SchoolType,
                    Phone = request.Phone ?? "Not provided",
                    Address = request.Address ?? "Not provided",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.UserProfiles.Add(userProfile);

                await _context.SaveChangesAsync();

                var response = new InstitutionResponse
                {
                    Id = institution.Id,
                    Name = institution.Name,
                    Type = institution.Type,
                    PrincipalName = request.PrincipalName ?? "Principal",
                    Email = institution.Email,
                    Phone = institution.Phone,
                    Address = institution.Address,
                    Status = institution.IsActive ? "Active" : "Inactive",
                    CreatedAt = institution.CreatedAt
                };

                return Ok(new ApiResponse<InstitutionResponse>
                {
                    Success = true,
                    Message = "Institution registered successfully",
                    Data = response
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in institution registration: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                return StatusCode(500, new ApiResponse<InstitutionResponse>
                {
                    Success = false,
                    Message = "An error occurred while registering the institution",
                    Data = null,
                    Error = ex.Message
                });
            }
        }
    }
}
