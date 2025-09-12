using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class VoucherRedemption
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string VoucherId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string UserId { get; set; } = string.Empty;
        
        public DateTime RedemptionDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "completed"; // pending, completed, failed, cancelled
        
        [Required]
        public int LearnerCount { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string ParentGuardianName { get; set; } = string.Empty;
        
        public DateTime ActivationDate { get; set; } = DateTime.UtcNow;
        
        public DateTime? ExpiryDate { get; set; }
        
        [MaxLength(500)]
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
