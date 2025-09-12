using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Voucher
    {
        public Guid Id { get; set; }

        [Required, MaxLength(32)]
        public string VoucherCode { get; set; } = string.Empty; // unique

        [Required]
        public decimal Value { get; set; }

        [Required, MaxLength(10)]
        public string Currency { get; set; } = "ZAR";

        [Required, MaxLength(20)]
        public string Status { get; set; } = "issued"; // issued, redeemed, expired, void

        public Guid InstitutionId { get; set; }
        public Guid? IssuedByUserId { get; set; }
        public Guid? RedeemedByUserId { get; set; }

        [MaxLength(200)]
        public string? ParentGuardianName { get; set; }

        public DateTime? IssuedAt { get; set; }
        public DateTime? RedeemedAt { get; set; }
        public DateTime? ExpiryAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
