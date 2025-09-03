using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class Teacher
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? Subject { get; set; }
        
        [MaxLength(100)]
        public string? Email { get; set; }
        
        [MaxLength(20)]
        public string? Phone { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
