using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [Required, MaxLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required, MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Role { get; set; } = string.Empty;  // principal, teacher, parent, admin, etc.

        public Guid InstitutionId { get; set; }

        public bool IsActive { get; set; } = true;

        // Password reset support (used by AuthController)
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
