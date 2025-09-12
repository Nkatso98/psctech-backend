using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace PSC.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoucherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VoucherController(ApplicationDbContext context)
        {
            _context = context;
        }

        // DTOs with proper validation
        public class CreateVoucherRequest
        {
            [Required(ErrorMessage = "Denomination is required")]
            [Range(0.01, double.MaxValue, ErrorMessage = "Denomination must be greater than 0")]
            public decimal Denomination { get; set; }

            [Required(ErrorMessage = "Parent/Guardian name is required")]
            [StringLength(255, ErrorMessage = "Parent/Guardian name cannot exceed 255 characters")]
            public string ParentGuardianName { get; set; }

            [Required(ErrorMessage = "Learner count is required")]
            [Range(1, 100, ErrorMessage = "Learner count must be between 1 and 100")]
            public int LearnerCount { get; set; }

            [Required(ErrorMessage = "Institution ID is required")]
            [StringLength(50, ErrorMessage = "Institution ID cannot exceed 50 characters")]
            public string InstitutionId { get; set; }

            [Required(ErrorMessage = "Issued by user ID is required")]
            [StringLength(50, ErrorMessage = "Issued by user ID cannot exceed 50 characters")]
            public string IssuedByUserId { get; set; }
        }

        public class RedeemVoucherRequest
        {
            [Required(ErrorMessage = "Voucher code is required")]
            [StringLength(50, ErrorMessage = "Voucher code cannot exceed 50 characters")]
            public string VoucherCode { get; set; }

            [Required(ErrorMessage = "User ID is required")]
            [StringLength(50, ErrorMessage = "User ID cannot exceed 50 characters")]
            public string UserId { get; set; }

            [Required(ErrorMessage = "Parent/Guardian name is required")]
            [StringLength(255, ErrorMessage = "Parent/Guardian name cannot exceed 255 characters")]
            public string ParentGuardianName { get; set; }

            [Required(ErrorMessage = "Learner count is required")]
            [Range(1, 100, ErrorMessage = "Learner count must be between 1 and 100")]
            public int LearnerCount { get; set; }
        }

        public class VoucherResponse
        {
            public string Id { get; set; }
            public string VoucherCode { get; set; }
            public decimal Denomination { get; set; }
            public string ParentGuardianName { get; set; }
            public int LearnerCount { get; set; }
            public string InstitutionId { get; set; }
            public string IssuedByUserId { get; set; }
            public string Status { get; set; }
            public DateTime IssuedAt { get; set; }
            public DateTime ExpiresAt { get; set; }
        }

        public class VoucherRedemptionResponse
        {
            public string RedemptionId { get; set; }
            public string VoucherCode { get; set; }
            public string UserId { get; set; }
            public string ParentGuardianName { get; set; }
            public int LearnerCount { get; set; }
            public decimal Denomination { get; set; }
            public DateTime RedeemedAt { get; set; }
        }

        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse<VoucherResponse>>> CreateVoucher([FromBody] CreateVoucherRequest request)
        {
            try
            {
                // Use stored procedure for better performance and validation
                var result = await _context.Database.SqlQueryRaw<VoucherResponse>(
                    "EXEC dbo.sp_create_voucher @p0, @p1, @p2, @p3, @p4",
                    request.Denomination,
                    request.ParentGuardianName,
                    request.LearnerCount,
                    request.InstitutionId,
                    request.IssuedByUserId
                ).FirstOrDefaultAsync();

                if (result == null)
                {
                    return BadRequest(new ApiResponse<VoucherResponse>
                    {
                        Success = false,
                        Message = "Failed to create voucher",
                        Data = null
                    });
                }

                return Ok(new ApiResponse<VoucherResponse>
                {
                    Success = true,
                    Message = "Voucher created successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<VoucherResponse>
                {
                    Success = false,
                    Message = "An error occurred while creating the voucher",
                    Data = null,
                    Error = ex.Message
                });
            }
        }

        [HttpPost("redeem")]
        public async Task<ActionResult<ApiResponse<VoucherRedemptionResponse>>> RedeemVoucher([FromBody] RedeemVoucherRequest request)
        {
            try
            {
                // Use stored procedure for better performance and validation
                var result = await _context.Database.SqlQueryRaw<VoucherRedemptionResponse>(
                    "EXEC dbo.sp_redeem_voucher @p0, @p1, @p2, @p3",
                    request.VoucherCode,
                    request.UserId,
                    request.ParentGuardianName,
                    request.LearnerCount
                ).FirstOrDefaultAsync();

                if (result == null)
                {
                    return BadRequest(new ApiResponse<VoucherRedemptionResponse>
                    {
                        Success = false,
                        Message = "Failed to redeem voucher",
                        Data = null
                    });
                }

                return Ok(new ApiResponse<VoucherRedemptionResponse>
                {
                    Success = true,
                    Message = "Voucher redeemed successfully",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<VoucherRedemptionResponse>
                {
                    Success = false,
                    Message = "An error occurred while redeeming the voucher",
                    Data = null,
                    Error = ex.Message
                });
            }
        }

        [HttpGet("institution/{institutionId}")]
        public async Task<ActionResult<ApiResponse<List<VoucherResponse>>>> GetInstitutionVouchers(string institutionId)
        {
            try
            {
                var vouchers = await _context.Vouchers
                    .Where(v => v.InstitutionId == institutionId)
                    .Select(v => new VoucherResponse
                    {
                        Id = v.Id.ToString(),
                        VoucherCode = v.VoucherCode,
                        Denomination = v.Denomination,
                        ParentGuardianName = v.ParentGuardianName,
                        LearnerCount = v.LearnerCount,
                        InstitutionId = v.InstitutionId,
                        IssuedByUserId = v.IssuedByUserId,
                        Status = v.Status,
                        IssuedAt = v.IssuedAt,
                        ExpiresAt = v.ExpiresAt
                    })
                    .ToListAsync();

                return Ok(new ApiResponse<List<VoucherResponse>>
                {
                    Success = true,
                    Message = "Institution vouchers retrieved successfully",
                    Data = vouchers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<VoucherResponse>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving institution vouchers",
                    Data = null,
                    Error = ex.Message
                });
            }
        }
    }

    // Helper classes
    public class Voucher
    {
        public Guid Id { get; set; }
        public string VoucherCode { get; set; }
        public decimal Denomination { get; set; }
        public string ParentGuardianName { get; set; }
        public int LearnerCount { get; set; }
        public string InstitutionId { get; set; }
        public string IssuedByUserId { get; set; }
        public string Status { get; set; }
        public DateTime IssuedAt { get; set; }
        public DateTime? RedeemedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public string Error { get; set; }
    }
}









