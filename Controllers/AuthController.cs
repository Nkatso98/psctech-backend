using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PscTechBackend.Data;
using PscTechBackend.Models;
// using PscTechBackend.Attributes; // Uncomment when your Jwt middleware is wired
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

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
                if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "Email and password are required"
                    });
                }

                // We use Email as the username
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Username);

                if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                {
                    return Unauthorized(new ApiResponse<LoginResponse>
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    });
                }

                var token = GenerateJwtToken(user);

                var response = new LoginResponse
                {
                    UserId = user.Id.ToString(),
                    Username = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role,
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
                if (string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Password) ||
                    string.IsNullOrWhiteSpace(request.FirstName) ||
                    string.IsNullOrWhiteSpace(request.LastName) ||
                    string.IsNullOrWhiteSpace(request.Role))
                {
                    return BadRequest(new ApiResponse<RegisterResponse>
                    {
                        Success = false,
                        Message = "Email, password, first name, last name and role are required"
                    });
                }

                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new ApiResponse<RegisterResponse>
                    {
                        Success = false,
                        Message = "Email already registered"
                    });
                }

                var user = new User
                {
                    // Your model uses int Id; EF will assign if configured as identity.
                    Email = request.Email,
                    PasswordHash = HashPassword(request.Password),
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Role = request.Role,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var res = new RegisterResponse
                {
                    UserId = user.Id.ToString(),
                    Username = user.Email,
                    Message = "User registered successfully"
                };

                return Ok(new ApiResponse<RegisterResponse>
                {
                    Success = true,
                    Data = res,
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

        // POST: api/auth/forgot-password  (No token fields in User model, so we just respond OK)
        [HttpPost("forgot-password")]
        public ActionResult<ApiResponse<ForgotPasswordResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new ApiResponse<ForgotPasswordResponse>
                {
                    Success = false,
                    Message = "Email is required"
                });
            }

            // In your current model, there are no reset-token columns.
            // You can implement email sending later; respond generically now.
            return Ok(new ApiResponse<ForgotPasswordResponse>
            {
                Success = true,
                Data = new ForgotPasswordResponse { Message = "If the email exists, a reset link has been sent" },
                Message = "If the email exists, a reset link has been sent"
            });
        }

        // POST: api/auth/reset-password (stubbed to 501 since no token storage fields exist)
        [HttpPost("reset-password")]
        public ActionResult<ApiResponse<ResetPasswordResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            return StatusCode(501, new ApiResponse<ResetPasswordResponse>
            {
                Success = false,
                Message = "Password reset tokens are not enabled in the current schema"
            });
        }

        // POST: api/auth/change-password
        [HttpPost("change-password")]
        public async Task<ActionResult<ApiResponse<ChangePasswordResponse>>> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                // Read userId from JWT claims if your middleware sets HttpContext.User.
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userIdStr) || !int.TryParse(userIdStr, out var userId))
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

                if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
                {
                    return BadRequest(new ApiResponse<ChangePasswordResponse>
                    {
                        Success = false,
                        Message = "Current password is incorrect"
                    });
                }

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

        // GET: api/auth/profile
        [HttpGet("profile")]
        // [JwtAuthorize] // enable when middleware is ready
        public async Task<ActionResult<ApiResponse<UserProfileResponse>>> GetProfile()
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userIdStr) || !int.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized(new ApiResponse<UserProfileResponse>
                    {
                        Success = false,
                        Message = "Unauthorized"
                    });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                {
                    return NotFound(new ApiResponse<UserProfileResponse>
                    {
                        Success = false,
                        Message = "User not found"
                    });
                }

                var response = new UserProfileResponse
                {
                    UserId = user.Id.ToString(),
                    Username = user.Email,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
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

        // Helper methods
        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash) => HashPassword(password) == hash;

        private string GenerateJwtToken(User user)
        {
            var keyStr = _configuration["Jwt:Key"] ?? "YourSecretKeyHere";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
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
    }

    // DTOs + ApiResponse (kept compatible with your current frontend expectations where possible)
    public class LoginRequest { public string Username { get; set; } = ""; public string Password { get; set; } = ""; }
    public class LoginResponse
    {
        public string UserId { get; set; } = "";
        public string Username { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string Role { get; set; } = "";
        public string Token { get; set; } = "";
        public string Message { get; set; } = "";
    }
    public class RegisterRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Role { get; set; } = "";
    }
    public class RegisterResponse { public string UserId { get; set; } = ""; public string Username { get; set; } = ""; public string Message { get; set; } = ""; }
    public class ForgotPasswordRequest { public string Email { get; set; } = ""; }
    public class ForgotPasswordResponse { public string Message { get; set; } = ""; }
    public class ResetPasswordRequest { public string Token { get; set; } = ""; public string NewPassword { get; set; } = ""; }
    public class ResetPasswordResponse { public string Message { get; set; } = ""; }
    public class ChangePasswordRequest { public string CurrentPassword { get; set; } = ""; public string NewPassword { get; set; } = ""; }
    public class ChangePasswordResponse { public string Message { get; set; } = ""; }
    public class UserProfileResponse
    {
        public string UserId { get; set; } = "";
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Role { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string Message { get; set; } = "";
        public string? Error { get; set; }
    }
}
