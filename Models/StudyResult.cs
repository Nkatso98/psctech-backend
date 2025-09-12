using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Models
{
    public class StudyResult
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid SessionId { get; set; }

        [Required, MaxLength(100)]
        public string Subject { get; set; } = string.Empty;

        [MaxLength(10)]
        public string? Grade { get; set; }

        // Aggregates
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int Score { get; set; }       // 0–100
        public int TimeSpent { get; set; }   // seconds

        // JSON blobs as text
        public string? Answers { get; set; }
        public string? Recommendations { get; set; }
        public string? WeakAreas { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
