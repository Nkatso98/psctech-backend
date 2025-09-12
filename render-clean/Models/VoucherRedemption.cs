using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class VoucherRedemption
    {
        public Guid Id { get; set; }

        [Required]
        public Guid VoucherId { get; set; }

        [Required]
        public Guid RedeemedByUserId { get; set; }

        [Required]
        public Guid InstitutionId { get; set; }

        public DateTime RedeemedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
