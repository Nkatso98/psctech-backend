using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class UserProfile
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
