using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Voucher
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(64)]
        public string CodeHash { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(32)]
        public string CodeSalt { get; set; } = string.Empty;
        
        [Required]
        public int Denomination { get; set; } // Fixed denominations: 5,10,15,20,25,30,35,40,45
        
        [Required]
        [MaxLength(255)]
        public string ParentGuardianName { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 10)]
        public int LearnerCount { get; set; } // Number of learners (1-10)
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "active"; // active, redeemed, expired, cancelled
        
        [Required]
        [MaxLength(50)]
        public string InstitutionId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string IssuedByUserId { get; set; } = string.Empty;
        
        public DateTime IssuedDate { get; set; } = DateTime.UtcNow;
        
        [MaxLength(50)]
        public string? RedeemedByUserId { get; set; }
        
        public DateTime? RedeemedDate { get; set; }
        
        public DateTime? ExpiryDate { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
