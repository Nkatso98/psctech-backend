using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Institution
    {
        public Guid Id { get; set; }

        [Required, MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Code { get; set; } = string.Empty; // unique business key like SCH123456

        [MaxLength(255)]
        public string? Email { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
