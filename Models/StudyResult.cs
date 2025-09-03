using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class StudyResult
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Subject { get; set; } = string.Empty;
        
        [MaxLength(10)]
        public string? Grade { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
