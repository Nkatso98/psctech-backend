using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Voucher
    {
        public int Id { get; set; }
        [Required]
        public string Code { get; set; } = string.Empty;
        public decimal Denomination { get; set; }
        [Required]
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
