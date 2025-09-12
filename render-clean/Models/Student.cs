using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Student
    {
        public Guid Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string StudentNumber { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [MaxLength(255)]
        public string FullName => $"{FirstName} {LastName}".Trim();
        
        [Required]
        [MaxLength(10)]
        public string Grade { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        public string InstitutionId { get; set; } = string.Empty;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
