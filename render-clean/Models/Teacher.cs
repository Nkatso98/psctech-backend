using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Teacher
    {
        public Guid Id { get; set; }

        [Required]
        public Guid InstitutionId { get; set; }

        [Required, MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
