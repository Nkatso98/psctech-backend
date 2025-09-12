using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class InstitutionDetails
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string InstitutionId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = string.Empty;
        
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
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
