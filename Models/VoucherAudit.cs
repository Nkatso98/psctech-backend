using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class VoucherAudit
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Details { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }
}
