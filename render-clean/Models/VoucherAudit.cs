using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class VoucherAudit
    {
        public Guid Id { get; set; }

        [Required]
        public Guid VoucherId { get; set; }

        [Required, MaxLength(50)]
        public string Action { get; set; } = string.Empty; // create, issue, redeem, expire, void

        public Guid? PerformedByUserId { get; set; }

        public DateTime PerformedAt { get; set; }

        // Store any extra info as JSON text (who, where, ip, etc.)
        public string? MetadataJson { get; set; }
    }
}
