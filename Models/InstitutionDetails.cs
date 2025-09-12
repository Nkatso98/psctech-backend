using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class InstitutionDetails
    {
        public Guid Id { get; set; }

        [Required]
        public Guid InstitutionId { get; set; }

        [MaxLength(128)]
        public string? DatabaseName { get; set; }

        [MaxLength(128)]
        public string? ServerName { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
