using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class StudyResult
    {
        [Required]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid SessionId { get; set; }

        [Required]
        public int TotalQuestions { get; set; }

        [Required]
        public int CorrectAnswers { get; set; }

        [Required]
        public int Score { get; set; }

        [Required]
        public int TimeSpent { get; set; }

        [Required]
        public string Answers { get; set; } = string.Empty; // JSON serialized

        [Required]
        public string Recommendations { get; set; } = string.Empty; // JSON serialized

        [Required]
        public string WeakAreas { get; set; } = string.Empty; // JSON serialized

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
    }
}









