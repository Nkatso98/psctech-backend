using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class VoucherAudit
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string VoucherId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty; // created, redeemed, expired, cancelled, viewed
        
        [MaxLength(50)]
        public string? UserId { get; set; }
        
        [MaxLength(500)]
        public string? Details { get; set; }
        
        [MaxLength(45)]
        public string? IpAddress { get; set; }
        
        [MaxLength(500)]
        public string? UserAgent { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
