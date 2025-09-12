using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Institution
    {
        [Required]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // Primary School, Secondary School, etc.
        
        [MaxLength(100)]
        public string? District { get; set; }
        
        [MaxLength(100)]
        public string? Province { get; set; }
        
        [MaxLength(100)]
        public string Country { get; set; } = "South Africa";
        
        [MaxLength(500)]
        public string? Address { get; set; }
        
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        [MaxLength(255)]
        public string? Email { get; set; }
        
        [MaxLength(255)]
        public string? Website { get; set; }
        
        [MaxLength(500)]
        public string? LogoUrl { get; set; }
        
        [MaxLength(20)]
        public string SubscriptionPlan { get; set; } = "basic"; // basic, premium, enterprise
        
        [MaxLength(20)]
        public string SubscriptionStatus { get; set; } = "active"; // active, expired, suspended
        
        public DateTime? SubscriptionExpiry { get; set; }
        
        public int MaxUsers { get; set; } = 100;
        
        public int MaxStudents { get; set; } = 1000;
        
        [Required]
        [MaxLength(128)]
        public string DatabaseName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(128)]
        public string ServerName { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? ConnectionString { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
