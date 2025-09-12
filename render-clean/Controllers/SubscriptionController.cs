using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PscTechBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public SubscriptionController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Get subscription API information
        /// </summary>
        [HttpGet]
        public ActionResult<object> GetSubscriptionApiInfo()
        {
            return Ok(new
            {
                message = "PSC Tech Subscription API",
                version = "1.0.0",
                status = "active",
                timestamp = DateTime.UtcNow,
                endpoints = new[]
                {
                    "/api/subscription/plans",
                    "/api/subscription/institution/{code}",
                    "/api/subscription/billing/{code}",
                    "/api/subscription/analytics/{code}",
                    "/api/subscription/upgrade",
                    "/api/subscription/cancel"
                },
                description = "Multi-tenant subscription management API for PSC Tech platform"
            });
        }

        /// <summary>
        /// Get subscription plans available
        /// </summary>
        [HttpGet("plans")]
        public ActionResult<IEnumerable<SubscriptionPlan>> GetSubscriptionPlans()
        {
            var plans = new List<SubscriptionPlan>
            {
                new SubscriptionPlan
                {
                    Id = "basic",
                    Name = "Basic Plan",
                    Description = "Essential features for small institutions",
                    Price = 99.99m,
                    Currency = "USD",
                    BillingCycle = "monthly",
                    Features = new List<string>
                    {
                        "Up to 100 students",
                        "Basic voucher system",
                        "Standard support",
                        "Email notifications"
                    },
                    Limits = new PlanLimits
                    {
                        MaxStudents = 100,
                        MaxTeachers = 10,
                        MaxVouchersPerMonth = 1000,
                        StorageGB = 10
                    }
                },
                new SubscriptionPlan
                {
                    Id = "premium",
                    Name = "Premium Plan",
                    Description = "Advanced features for growing institutions",
                    Price = 199.99m,
                    Currency = "USD",
                    BillingCycle = "monthly",
                    Features = new List<string>
                    {
                        "Up to 500 students",
                        "Advanced voucher system",
                        "Priority support",
                        "SMS notifications",
                        "Analytics dashboard",
                        "Custom branding"
                    },
                    Limits = new PlanLimits
                    {
                        MaxStudents = 500,
                        MaxTeachers = 25,
                        MaxVouchersPerMonth = 5000,
                        StorageGB = 50
                    }
                },
                new SubscriptionPlan
                {
                    Id = "enterprise",
                    Name = "Enterprise Plan",
                    Description = "Full-featured solution for large institutions",
                    Price = 399.99m,
                    Currency = "USD",
                    BillingCycle = "monthly",
                    Features = new List<string>
                    {
                        "Unlimited students",
                        "Enterprise voucher system",
                        "24/7 premium support",
                        "Advanced analytics",
                        "Custom integrations",
                        "White-label solution",
                        "Dedicated account manager"
                    },
                    Limits = new PlanLimits
                    {
                        MaxStudents = -1, // Unlimited
                        MaxTeachers = -1, // Unlimited
                        MaxVouchersPerMonth = -1, // Unlimited
                        StorageGB = 500
                    }
                }
            };

            return Ok(plans);
        }

        /// <summary>
        /// Get institution subscription details
        /// </summary>
        [HttpGet("institution/{institutionCode}")]
        public ActionResult<InstitutionSubscription> GetInstitutionSubscription(string institutionCode)
        {
            // This would typically query your multi-tenant database
            // For now, returning mock data
            var subscription = new InstitutionSubscription
            {
                InstitutionCode = institutionCode,
                InstitutionName = "Sample Institution",
                CurrentPlan = "premium",
                Status = "active",
                StartDate = DateTime.UtcNow.AddMonths(-3),
                ExpiryDate = DateTime.UtcNow.AddMonths(9),
                AutoRenew = true,
                BillingCycle = "monthly",
                NextBillingDate = DateTime.UtcNow.AddMonths(1),
                Usage = new UsageMetrics
                {
                    CurrentStudents = 245,
                    CurrentTeachers = 18,
                    VouchersThisMonth = 1250,
                    StorageUsedGB = 23.5m,
                    LastUpdated = DateTime.UtcNow
                }
            };

            return Ok(subscription);
        }

        /// <summary>
        /// Upgrade institution subscription
        /// </summary>
        [HttpPost("upgrade")]
        public ActionResult<SubscriptionResponse> UpgradeSubscription([FromBody] UpgradeRequest request)
        {
            // Validate request
            if (string.IsNullOrEmpty(request.InstitutionCode) || string.IsNullOrEmpty(request.NewPlan))
            {
                return BadRequest(new { error = "Institution code and new plan are required" });
            }

            // This would typically update your multi-tenant database
            var response = new SubscriptionResponse
            {
                Success = true,
                Message = $"Successfully upgraded {request.InstitutionCode} to {request.NewPlan} plan",
                NewPlan = request.NewPlan,
                EffectiveDate = DateTime.UtcNow,
                NextBillingDate = DateTime.UtcNow.AddMonths(1),
                TransactionId = Guid.NewGuid().ToString()
            };

            return Ok(response);
        }

        /// <summary>
        /// Cancel institution subscription
        /// </summary>
        [HttpPost("cancel")]
        public ActionResult<SubscriptionResponse> CancelSubscription([FromBody] CancelRequest request)
        {
            if (string.IsNullOrEmpty(request.InstitutionCode))
            {
                return BadRequest(new { error = "Institution code is required" });
            }

            var response = new SubscriptionResponse
            {
                Success = true,
                Message = $"Subscription cancelled for {request.InstitutionCode}",
                CancellationDate = DateTime.UtcNow,
                AccessUntil = DateTime.UtcNow.AddDays(request.GracePeriodDays),
                TransactionId = Guid.NewGuid().ToString()
            };

            return Ok(response);
        }

        /// <summary>
        /// Get billing history for an institution
        /// </summary>
        [HttpGet("billing/{institutionCode}")]
        public ActionResult<IEnumerable<BillingRecord>> GetBillingHistory(string institutionCode)
        {
            var billingHistory = new List<BillingRecord>
            {
                new BillingRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    InstitutionCode = institutionCode,
                    Amount = 199.99m,
                    Currency = "USD",
                    Description = "Premium Plan - Monthly",
                    BillingDate = DateTime.UtcNow.AddMonths(-1),
                    Status = "paid",
                    InvoiceNumber = "INV-2024-001"
                },
                new BillingRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    InstitutionCode = institutionCode,
                    Amount = 199.99m,
                    Currency = "USD",
                    Description = "Premium Plan - Monthly",
                    BillingDate = DateTime.UtcNow.AddMonths(-2),
                    Status = "paid",
                    InvoiceNumber = "INV-2024-002"
                }
            };

            return Ok(billingHistory);
        }

        /// <summary>
        /// Get subscription usage analytics
        /// </summary>
        [HttpGet("analytics/{institutionCode}")]
        public ActionResult<SubscriptionAnalytics> GetSubscriptionAnalytics(string institutionCode)
        {
            var analytics = new SubscriptionAnalytics
            {
                InstitutionCode = institutionCode,
                Period = "last_30_days",
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                Metrics = new Dictionary<string, object>
                {
                    { "total_vouchers", 1250 },
                    { "active_students", 245 },
                    { "active_teachers", 18 },
                    { "storage_used_gb", 23.5 },
                    { "api_calls", 15420 },
                    { "uptime_percentage", 99.9 }
                },
                Trends = new Dictionary<string, object>
                {
                    { "voucher_growth", "+15%" },
                    { "student_growth", "+8%" },
                    { "storage_growth", "+12%" }
                }
            };

            return Ok(analytics);
        }
    }

    // Data Models
    public class SubscriptionPlan
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; }
        public string BillingCycle { get; set; }
        public List<string> Features { get; set; }
        public PlanLimits Limits { get; set; }
    }

    public class PlanLimits
    {
        public int MaxStudents { get; set; }
        public int MaxTeachers { get; set; }
        public int MaxVouchersPerMonth { get; set; }
        public int StorageGB { get; set; }
    }

    public class InstitutionSubscription
    {
        public string InstitutionCode { get; set; }
        public string InstitutionName { get; set; }
        public string CurrentPlan { get; set; }
        public string Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool AutoRenew { get; set; }
        public string BillingCycle { get; set; }
        public DateTime NextBillingDate { get; set; }
        public UsageMetrics Usage { get; set; }
    }

    public class UsageMetrics
    {
        public int CurrentStudents { get; set; }
        public int CurrentTeachers { get; set; }
        public int VouchersThisMonth { get; set; }
        public decimal StorageUsedGB { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class UpgradeRequest
    {
        public string InstitutionCode { get; set; }
        public string NewPlan { get; set; }
        public bool ImmediateUpgrade { get; set; } = false;
    }

    public class CancelRequest
    {
        public string InstitutionCode { get; set; }
        public int GracePeriodDays { get; set; } = 30;
        public string Reason { get; set; }
    }

    public class SubscriptionResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string NewPlan { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public DateTime? NextBillingDate { get; set; }
        public DateTime? CancellationDate { get; set; }
        public DateTime? AccessUntil { get; set; }
        public string TransactionId { get; set; }
    }

    public class BillingRecord
    {
        public string Id { get; set; }
        public string InstitutionCode { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Description { get; set; }
        public DateTime BillingDate { get; set; }
        public string Status { get; set; }
        public string InvoiceNumber { get; set; }
    }

    public class SubscriptionAnalytics
    {
        public string InstitutionCode { get; set; }
        public string Period { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Dictionary<string, object> Metrics { get; set; }
        public Dictionary<string, object> Trends { get; set; }
    }
}
