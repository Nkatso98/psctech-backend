using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PscTechBackend.Data;
using PscTechBackend.Models;
using System.Text.Json;

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

        [HttpPost("result")]
        public async Task<ActionResult<ApiResponse<object>>> SaveStudyResult([FromBody] StudyResultRequest request)
        {
            try
            {
                var studyResult = new StudyResult
                {
                    Id = Guid.NewGuid(),
                    UserId = Guid.Parse(request.UserId),
                    SessionId = Guid.Parse(request.SessionId),
                    TotalQuestions = request.Result.TotalQuestions,
                    CorrectAnswers = request.Result.CorrectAnswers,
                    Score = request.Result.Score,
                    TimeSpent = request.Result.TimeSpent,
                    Answers = JsonSerializer.Serialize(request.Result.Answers),
                    Recommendations = JsonSerializer.Serialize(request.Result.Recommendations),
                    WeakAreas = JsonSerializer.Serialize(request.Result.WeakAreas),
                    CreatedAt = DateTime.UtcNow
                };

                _context.StudyResults.Add(studyResult);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Study result saved successfully",
                    Data = new { resultId = studyResult.Id }
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

        [HttpGet("results/user/{userId}")]
        public async Task<ActionResult<ApiResponse<List<StudyResultResponse>>>> GetUserStudyResults(string userId)
        {
            try
            {
                var results = await _context.StudyResults
                    .Where(r => r.UserId == Guid.Parse(userId))
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new StudyResultResponse
                    {
                        Id = r.Id,
                        SessionId = r.SessionId,
                        TotalQuestions = r.TotalQuestions,
                        CorrectAnswers = r.CorrectAnswers,
                        Score = r.Score,
                        TimeSpent = r.TimeSpent,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<List<StudyResultResponse>>
                {
                    Success = true,
                    Data = results
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<StudyResultResponse>>
                {
                    Success = false,
                    Message = $"Error retrieving study results: {ex.Message}"
                });
            }
        }

        [HttpPost("questions/generate")]
        public async Task<ActionResult<ApiResponse<List<StudyQuestionResponse>>>> GenerateQuestions([FromBody] GenerateQuestionsRequest request)
        {
            try
            {
                // Generate AI questions based on subject and topic
                var questions = GenerateAIQuestions(request.Subject, request.Topic, request.Count);
                
                return Ok(new ApiResponse<List<StudyQuestionResponse>>
                {
                    Success = true,
                    Data = questions
                });
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
            
            // Generate questions based on subject and topic
            if (subject.ToLower() == "mathematics")
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
                            Explanation = "To solve 2x + 5 = 13, subtract 5 from both sides: 2x = 8. Then divide both sides by 2: x = 4.",
                            Difficulty = "easy",
                            Topic = "Linear Equations"
                        },
                        new StudyQuestionResponse
                        {
                            Id = Guid.NewGuid(),
                            Question = "Factor the quadratic expression: x² - 4x + 4",
                            Options = new[] { "(x - 2)²", "(x + 2)²", "(x - 2)(x + 2)", "(x - 4)(x + 1)" },
                            CorrectAnswer = "(x - 2)²",
                            Explanation = "This is a perfect square trinomial. x² - 4x + 4 = (x - 2)² because (x - 2)² = x² - 4x + 4.",
                            Difficulty = "medium",
                            Topic = "Factoring"
                        }
                    });
                }
            }
            else if (subject.ToLower() == "science")
            {
                questions.AddRange(new[]
                {
                    new StudyQuestionResponse
                    {
                        Id = Guid.NewGuid(),
                        Question = "What is the chemical formula for water?",
                        Options = new[] { "H2O", "CO2", "O2", "H2" },
                        CorrectAnswer = "H2O",
                        Explanation = "Water is composed of two hydrogen atoms and one oxygen atom, giving it the chemical formula H2O.",
                        Difficulty = "easy",
                        Topic = "Chemical Formulas"
                    }
                });
            }

            return questions.Take(count).ToList();
        }
    }

    public class StudyResultRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public StudyResultData Result { get; set; } = new();
    }

    public class StudyResultData
    {
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int Score { get; set; }
        public int TimeSpent { get; set; }
        public List<AnswerData> Answers { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public List<string> WeakAreas { get; set; } = new();
    }

    public class AnswerData
    {
        public string QuestionId { get; set; } = string.Empty;
        public string SelectedAnswer { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int TimeSpent { get; set; }
    }

    public class StudyResultResponse
    {
        public Guid Id { get; set; }
        public Guid SessionId { get; set; }
        public int TotalQuestions { get; set; }
        public int CorrectAnswers { get; set; }
        public int Score { get; set; }
        public int TimeSpent { get; set; }
        public DateTime CreatedAt { get; set; }
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
}
