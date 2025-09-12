using Microsoft.AspNetCore.Mvc;

namespace psctech_backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;

        public HealthController(ILogger<HealthController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Get()
        {
            _logger.LogInformation("Health check requested at {time}", DateTime.UtcNow);
            
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "PSCTECH Backend API",
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"
            });
        }

        [HttpGet("detailed")]
        public IActionResult GetDetailed()
        {
            _logger.LogInformation("Detailed health check requested at {time}", DateTime.UtcNow);
            
            var healthStatus = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "PSCTECH Backend API",
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
                uptime = Environment.TickCount64,
                memory = GC.GetTotalMemory(false),
                database = "connected", // You can add actual database connectivity check here
                features = new
                {
                    authentication = true,
                    multiTenant = true,
                    voucherSystem = true,
                    studyZone = true
                }
            };

            return Ok(healthStatus);
        }
    }
}








