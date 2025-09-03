using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PscTechBackend.Data;
using PscTechBackend.Models;
using PscTechBackend.Attributes;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Configuration;

namespace PscTechBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly PscTechDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(PscTechDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "Username and password are required"
                    });
                }

                // Find user by email (using username as email)
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Username);

                if (user == null)
                {
                    return Unauthorized(new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    });
                }

                // Verify password
                if (!VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "Invalid username or password"
                    });
                }

                // Check if user is active
                if (!user.IsActive)
                {
                    return Unauthorized(new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "Account is not active"
                    });
                }

                // Load profile and institution name (optional)
                var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == user.Id);
                var institution = await _context.Institutions.FirstOrDefaultAsync(i => i.Id == user.InstitutionId);

                // Generate JWT token
                var token = GenerateJwtToken(user);

                var response = new LoginResponse
                {
                    UserId = user.Id.ToString(),
                    Username = user.Email, // Use email as username
                    FirstName = profile?.FirstName ?? string.Empty,
                    LastName = profile?.LastName ?? string.Empty,
                    Email = user.Email,
                    Role = user.Role,
                    InstitutionId = user.InstitutionId.ToString(),
                    InstitutionName = institution?.Name ?? string.Empty,
                    Token = token,
                    Message = "Login successful"
                };

                return Ok(new ApiResponse<LoginResponse>
                {
                    Success = true,
                    Data = response,
                    Message = "Login successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<LoginResponse>
                {
                    Success = false,
                    Message = "An error occurred during login",
                    Error = ex.Message
                });
            }
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<RegisterResponse>>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrWhiteSpace(request.Username) || 
                    string.IsNullOrWhiteSpace(request.Password) ||
                    string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.FirstName) ||
                    string.IsNullOrWhiteSpace(request.LastName) ||
                    string.IsNullOrWhiteSpace(request.Role) ||
                    string.IsNullOrWhiteSpace(request.InstitutionId))
                {
                    return BadRequest(new ApiResponse<RegisterResponse>
                    {
                        Success = false,
                        Message = "All fields are required"
                    });
                }

                // Check if email already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (existingUser != null)
                {
                    return BadRequest(new ApiResponse<RegisterResponse>
                    {
                        Success = false,
                        Message = "Username already exists"
                    });
                }

                // Check if institution exists
                var institution = await _context.Institutions
                    .FirstOrDefaultAsync(i => i.Id == Guid.Parse(request.InstitutionId));

                if (institution == null)
                {
                    return BadRequest(new ApiResponse<RegisterResponse>
                    {
                        Success = false,
                        Message = "Institution not found"
                    });
                }

                // Hash password
                var passwordHash = HashPassword(request.Password);

                // Create new user
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    Role = request.Role,
                    InstitutionId = Guid.Parse(request.InstitutionId),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Create associated user profile
                var userProfile = new UserProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.UserProfiles.Add(userProfile);
                await _context.SaveChangesAsync();

                var response = new RegisterResponse
                {
                    UserId = user.Id.ToString(),
                    Username = user.Email, // Use email as username
                    Message = "User registered successfully"
                };

                return Ok(new ApiResponse<RegisterResponse>
                {
                    Success = true,
                    Data = response,
                    Message = "User registered successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<RegisterResponse>
                {
                    Success = false,
                    Message = "An error occurred during registration",
                    Error = ex.Message
                });
            }
        }

        // POST: api/auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task<ActionResult<ApiResponse<ForgotPasswordResponse>>> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email))
                {
                    return BadRequest(new ApiResponse<ForgotPasswordResponse>
                    {
                        Success = false,
                        Message = "Email is required"
                    });
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    // Don't reveal if user exists or not for security
                    return Ok(new ApiResponse<ForgotPasswordResponse>
                    {
                        Success = true,
                        Data = new ForgotPasswordResponse { Message = "If the email exists, a reset link has been sent" },
                        Message = "If the email exists, a reset link has been sent"
                    });
                }

                // Generate reset token
                var resetToken = GenerateResetToken();
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(24);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // TODO: Send email with reset link
                // For now, just return success

                return Ok(new ApiResponse<ForgotPasswordResponse>
                {
                    Success = true,
                    Data = new ForgotPasswordResponse { Message = "If the email exists, a reset link has been sent" },
                    Message = "If the email exists, a reset link has been sent"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<ForgotPasswordResponse>
                {
                    Success = false,
                    Message = "An error occurred during password reset",
                    Error = ex.Message
                });
            }
        }

        // POST: api/auth/reset-password
        [HttpPost("reset-password")]
        public async Task<ActionResult<ApiResponse<ResetPasswordResponse>>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Token) || 
                    string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return BadRequest(new ApiResponse<ResetPasswordResponse>
                    {
                        Success = false,
                        Message = "Token and new password are required"
                    });
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.PasswordResetToken == request.Token && 
                                             u.PasswordResetTokenExpiry > DateTime.UtcNow);

                if (user == null)
                {
                    return BadRequest(new ApiResponse<ResetPasswordResponse>
                    {
                        Success = false,
                        Message = "Invalid or expired reset token"
                    });
                }

                // Update password
                user.PasswordHash = HashPassword(request.NewPassword);
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<ResetPasswordResponse>
                {
                    Success = true,
                    Data = new ResetPasswordResponse { Message = "Password reset successfully" },
                    Message = "Password reset successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<ResetPasswordResponse>
                {
                    Success = false,
                    Message = "An error occurred during password reset",
                    Error = ex.Message
                });
            }
        }

        // POST: api/auth/change-password
        [HttpPost("change-password")]
        public async Task<ActionResult<ApiResponse<ChangePasswordResponse>>> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                // Get user from token (you'll need to implement JWT token extraction)
                // For now, we'll use a placeholder
                var userId = GetUserIdFromToken();
                if (userId == Guid.Empty)
                {
                    return Unauthorized(new ApiResponse<ChangePasswordResponse>
                    {
                        Success = false,
                        Message = "Unauthorized"
                    });
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new ApiResponse<ChangePasswordResponse>
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                // Verify current password
                if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
                {
                    return BadRequest(new ApiResponse<ChangePasswordResponse>
                    {
                        Success = false,
                        Message = "Current password is incorrect"
                    });
                }

                // Update password
                user.PasswordHash = HashPassword(request.NewPassword);
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<ChangePasswordResponse>
                {
                    Success = true,
                    Data = new ChangePasswordResponse { Message = "Password changed successfully" },
                    Message = "Password changed successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<ChangePasswordResponse>
                {
                    Success = false,
                    Message = "An error occurred during password change",
                    Error = ex.Message
                });
            }
        }

        // POST: api/auth/logout
        [HttpPost("logout")]
        public ActionResult<ApiResponse<LogoutResponse>> Logout()
        {
            // In a stateless JWT implementation, logout is typically handled client-side
            // by removing the token. However, you could implement a token blacklist here.
            
            return Ok(new ApiResponse<LogoutResponse>
            {
                Success = true,
                Data = new LogoutResponse { Message = "Logged out successfully" },
                Message = "Logged out successfully"
            });
        }

        // GET: api/auth/profile
        [HttpGet("profile")]
        [JwtAuthorize]
        public async Task<ActionResult<ApiResponse<UserProfileResponse>>> GetProfile()
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == Guid.Empty)
                {
                    return Unauthorized(new ApiResponse<UserProfileResponse>
                    {
                        Success = false,
                        Message = "Unauthorized"
                    });
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return NotFound(new ApiResponse<UserProfileResponse>
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                var profile = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                var response = new UserProfileResponse
                {
                    UserId = user.Id.ToString(),
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = profile?.FirstName ?? string.Empty,
                    LastName = profile?.LastName ?? string.Empty,
                    Role = user.Role,
                    InstitutionId = user.InstitutionId.ToString(),
                    InstitutionName = string.Empty, // Will be loaded separately if needed
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };

                return Ok(new ApiResponse<UserProfileResponse>
                {
                    Success = true,
                    Data = response,
                    Message = "Profile retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<UserProfileResponse>
                {
                    Success = false,
                    Message = "An error occurred while retrieving profile",
                    Error = ex.Message
                });
            }
        }

        // PUT: api/auth/profile
        [HttpPut("profile")]
        [JwtAuthorize]
        public async Task<ActionResult<ApiResponse<UpdateProfileResponse>>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                var userId = GetUserIdFromToken();
                if (userId == Guid.Empty)
                {
                    return Unauthorized(new ApiResponse<UpdateProfileResponse>
                    {
                        Success = false,
                        Message = "Unauthorized"
                    });
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new ApiResponse<UpdateProfileResponse>
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                var profile = await _context.UserProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (profile == null)
                {
                    return NotFound(new ApiResponse<UpdateProfileResponse>
                    {
                        Success = false,
                        Message = "User profile not found"
                    });
                }

                // Update profile fields
                if (!string.IsNullOrWhiteSpace(request.FirstName))
                    profile.FirstName = request.FirstName;
                
                if (!string.IsNullOrWhiteSpace(request.LastName))
                    profile.LastName = request.LastName;

                profile.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new UpdateProfileResponse
                {
                    UserId = user.Id.ToString(),
                    FirstName = profile.FirstName,
                    LastName = profile.LastName,
                    Message = "Profile updated successfully"
                };

                return Ok(new ApiResponse<UpdateProfileResponse>
                {
                    Success = true,
                    Data = response,
                    Message = "Profile updated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<UpdateProfileResponse>
                {
                    Success = false,
                    Message = "An error occurred while updating profile",
                    Error = ex.Message
                });
            }
        }

        // GET: api/auth/test-admin
        [HttpGet("test-admin")]
        [JwtAuthorize("principal", "teacher")]
        public ActionResult<ApiResponse<TestResponse>> TestAdminAccess()
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userEmail = HttpContext.Items["UserEmail"]?.ToString();

            return Ok(new ApiResponse<TestResponse>
            {
                Success = true,
                Data = new TestResponse
                {
                    Message = "Admin access granted",
                    UserId = userId ?? "unknown",
                    UserRole = userRole ?? "unknown",
                    UserEmail = userEmail ?? "unknown"
                },
                Message = "Admin access granted"
            });
        }

        // GET: api/auth/test-teacher
        [HttpGet("test-teacher")]
        [JwtAuthorize("teacher")]
        public ActionResult<ApiResponse<TestResponse>> TestTeacherAccess()
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            var userRole = HttpContext.Items["UserRole"]?.ToString();
            var userEmail = HttpContext.Items["UserEmail"]?.ToString();

            return Ok(new ApiResponse<TestResponse>
            {
                Success = true,
                Data = new TestResponse
                {
                    Message = "Teacher access granted",
                    UserId = userId ?? "unknown",
                    UserRole = userRole ?? "unknown",
                    UserEmail = userEmail ?? "unknown"
                },
                Message = "Teacher access granted"
            });
        }

        // Helper methods
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashedPassword = HashPassword(password);
            return hashedPassword == hash;
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourSecretKeyHere"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("InstitutionId", user.InstitutionId.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "PscTechBackend",
                audience: _configuration["Jwt:Audience"] ?? "PscTechFrontend",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateResetToken()
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("/", "_")
                .Replace("+", "-")
                .Substring(0, 22);
        }

        private Guid GetUserIdFromToken()
        {
            // Get user ID from JWT middleware context
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var parsedUserId))
            {
                return Guid.Empty;
            }
            return parsedUserId;
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string InstitutionId { get; set; } = string.Empty;
        public string InstitutionName { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string InstitutionId { get; set; } = string.Empty;
    }

    public class RegisterResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ForgotPasswordResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ResetPasswordResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ChangePasswordResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    public class LogoutResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    public class UserProfileResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string InstitutionId { get; set; } = string.Empty;
        public string InstitutionName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateProfileRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class UpdateProfileResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class TestResponse
    {
        public string Message { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
    }
}
