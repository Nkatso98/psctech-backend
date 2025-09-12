using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PscTechBackend.Data;
using PscTechBackend.Models;

namespace PscTechBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudyController : ControllerBase
    {
        private readonly PscTechDbContext _context;

        public StudyController(PscTechDbContext context)
        {
            _context = context;
        }

        // Minimal save to your current StudyResult schema
        [HttpPost("result")]
        public async Task<ActionResult<ApiResponse<object>>> SaveStudyResult([FromBody] MinimalStudyResultRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Subject))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Subject is required"
                    });
                }

                var sr = new StudyResult
                {
                    Subject = request.Subject,
                    Grade = request.Grade,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.StudyResults.Add(sr);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Study result saved",
                    Data = new { id = sr.Id }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = $"Error saving study result: {ex.Message}"
                });
            }
        }

        // Simple listing (most recent first)
        [HttpGet("results")]
        public async Task<ActionResult<ApiResponse<List<StudyResult>>>> GetStudyResults()
        {
            var results = await _context.StudyResults
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(new ApiResponse<List<StudyResult>> { Success = true, Data = results });
        }

        // Your AI-like question generator preserved
        [HttpPost("questions/generate")]
        public ActionResult<ApiResponse<List<StudyQuestionResponse>>> GenerateQuestions([FromBody] GenerateQuestionsRequest request)
        {
            try
            {
                var questions = GenerateAIQuestions(request.Subject, request.Topic, request.Count);
                return Ok(new ApiResponse<List<StudyQuestionResponse>> { Success = true, Data = questions });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<StudyQuestionResponse>>
                {
                    Success = false,
                    Message = $"Error generating questions: {ex.Message}"
                });
            }
        }

        private List<StudyQuestionResponse> GenerateAIQuestions(string subject, string topic, int count)
        {
            var questions = new List<StudyQuestionResponse>();

            if (subject.Equals("mathematics", StringComparison.OrdinalIgnoreCase))
            {
                if (topic.ToLower().Contains("algebra"))
                {
                    questions.AddRange(new[]
                    {
                        new StudyQuestionResponse
                        {
                            Id = Guid.NewGuid(),
                            Question = "What is the solution to the equation 2x + 5 = 13?",
                            Options = new[] { "x = 4", "x = 8", "x = 3", "x = 6" },
                            CorrectAnswer = "x = 4",
                            Explanation = "2x = 8 → x = 4",
                            Difficulty = "easy",
                            Topic = "Linear Equations"
                        },
                        new StudyQuestionResponse
                        {
                            Id = Guid.NewGuid(),
                            Question = "Factor the quadratic expression: x² - 4x + 4",
                            Options = new[] { "(x - 2)²", "(x + 2)²", "(x - 2)(x + 2)", "(x - 4)(x + 1)" },
                            CorrectAnswer = "(x - 2)²",
                            Explanation = "Perfect square trinomial.",
                            Difficulty = "medium",
                            Topic = "Factoring"
                        }
                    });
                }
            }
            else if (subject.Equals("science", StringComparison.OrdinalIgnoreCase))
            {
                questions.Add(new StudyQuestionResponse
                {
                    Id = Guid.NewGuid(),
                    Question = "What is the chemical formula for water?",
                    Options = new[] { "H2O", "CO2", "O2", "H2" },
                    CorrectAnswer = "H2O",
                    Explanation = "Two hydrogen atoms and one oxygen atom.",
                    Difficulty = "easy",
                    Topic = "Chemical Formulas"
                });
            }

            return questions.Take(count).ToList();
        }
    }

    // DTOs
    public class MinimalStudyResultRequest
    {
        public string Subject { get; set; } = string.Empty;
        public string? Grade { get; set; }
    }

    public class GenerateQuestionsRequest
    {
        public string Subject { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
        public int Count { get; set; } = 5;
    }

    public class StudyQuestionResponse
    {
        public Guid Id { get; set; }
        public string Question { get; set; } = string.Empty;
        public string[] Options { get; set; } = Array.Empty<string>();
        public string CorrectAnswer { get; set; } = string.Empty;
        public string Explanation { get; set; } = string.Empty;
        public string Difficulty { get; set; } = string.Empty;
        public string Topic { get; set; } = string.Empty;
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string Message { get; set; } = "";
        public string? Error { get; set; }
    }
}
