using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PscTechBackend.Data;
using PscTechBackend.Models;

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

        public class InstitutionRegistrationRequest
        {
            [JsonPropertyName("schoolName")]
            [StringLength(255)]
            public string? SchoolName { get; set; }

            [JsonPropertyName("principalName")]
            [StringLength(255)]
            public string? PrincipalName { get; set; }

            [JsonPropertyName("email")]
            [EmailAddress]
            [StringLength(255)]
            public string? Email { get; set; }

            [JsonPropertyName("phone")]
            [StringLength(20)]
            public string? Phone { get; set; }

            [JsonPropertyName("address")]
            [StringLength(500)]
            public string? Address { get; set; }

            [JsonPropertyName("schoolType")]
            [Required]
            public string SchoolType { get; set; } = string.Empty;

            [JsonPropertyName("username")]
            [Required]
            [StringLength(50)]
            public string Username { get; set; } = string.Empty;

            [JsonPropertyName("password")]
            [Required]
            [StringLength(100, MinimumLength = 6)]
            public string Password { get; set; } = string.Empty;
        }

        public class InstitutionResponse
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public string PrincipalName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Phone { get; set; } = string.Empty;
            public string Address { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public DateTime CreatedAt { get; set; }
        }

        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<InstitutionResponse>>> Register([FromBody] InstitutionRegistrationRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = "Request body is null or invalid"
                    });
                }

                var allowedTypes = new[]
                {
                    "Primary School", "Secondary School", "Combined School",
                    "University", "College", "Technical Institute", "Vocational School"
                };

                if (string.IsNullOrWhiteSpace(request.SchoolType) || !allowedTypes.Contains(request.SchoolType))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = "Invalid or missing school type"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = "Username and password are required"
                    });
                }

                var emailToUse = request.Email ?? request.Username;

                if (await _context.Institutions.AnyAsync(i => i.Email == emailToUse))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = $"An institution with email '{emailToUse}' already exists"
                    });
                }

                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                    return BadRequest(new ApiResponse<InstitutionResponse>
                    {
                        Success = false,
                        Message = $"Username '{request.Username}' is already taken"
                    });
                }

                var institution = new Institution
                {
                    Id = Guid.NewGuid(),
                    Name = request.SchoolName ?? $"School {request.SchoolType}",
                    Type = request.SchoolType,
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

                var passwordHash = HashPassword(request.Password);

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

                var userProfile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FirstName = request.PrincipalName?.Split(' ').FirstOrDefault() ?? "Principal",
                    LastName = request.PrincipalName?.Split(' ').Skip(1).DefaultIfEmpty(request.SchoolType).Aggregate((a, b) => ($"{a} {b}")).Trim() ?? request.SchoolType,
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
                return StatusCode(500, new ApiResponse<InstitutionResponse>
                {
                    Success = false,
                    Message = "An error occurred while registering the institution",
                    Error = ex.Message
                });
            }
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
