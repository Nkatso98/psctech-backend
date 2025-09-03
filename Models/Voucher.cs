using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Voucher
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        public decimal Denomination { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
