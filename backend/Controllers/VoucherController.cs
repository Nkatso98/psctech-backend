using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using PscTechBackend.Models;
using PscTechBackend.Data;

namespace PscTechBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoucherController : ControllerBase
    {
        private readonly PscTechDbContext _context;

        public VoucherController(PscTechDbContext context)
        {
            _context = context;
        }

        // DTOs with proper validation
        public class CreateVoucherRequest
        {
            [Required(ErrorMessage = "Denomination is required")]
            [Range(5, 50, ErrorMessage = "Denomination must be between 5 and 50")]
            public decimal Denomination { get; set; }

            [Required(ErrorMessage = "Parent/Guardian name is required")]
            [StringLength(100, ErrorMessage = "Parent/Guardian name cannot exceed 100 characters")]
            public string ParentGuardianName { get; set; }

            [Required(ErrorMessage = "Learner count is required")]
            [Range(1, 10, ErrorMessage = "Learner count must be between 1 and 10")]
            public int LearnerCount { get; set; }

            [Required(ErrorMessage = "Institution ID is required")]
            public string InstitutionId { get; set; }

            [Required(ErrorMessage = "Issued by user ID is required")]
            public string IssuedByUserId { get; set; }
        }

        public class RedeemVoucherRequest
        {
            [Required(ErrorMessage = "Voucher code is required")]
            [StringLength(19, MinimumLength = 19, ErrorMessage = "Voucher code must be exactly 19 characters")]
            [RegularExpression(@"^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$", 
                ErrorMessage = "Voucher code must be in format XXXX-XXXX-XXXX-XXXX")]
            public string VoucherCode { get; set; }

            [Required(ErrorMessage = "User ID is required")]
            public string UserId { get; set; }

            [Required(ErrorMessage = "Parent/Guardian name is required")]
            [StringLength(100, ErrorMessage = "Parent/Guardian name cannot exceed 100 characters")]
            public string ParentGuardianName { get; set; }

            [Required(ErrorMessage = "Learner count is required")]
            [Range(1, 10, ErrorMessage = "Learner count must be between 1 and 10")]
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
            public DateTime CreatedAt { get; set; }
        }

        public class VoucherRedemptionResponse
        {
            public string Id { get; set; }
            public string VoucherCode { get; set; }
            public decimal Denomination { get; set; }
            public string ParentGuardianName { get; set; }
            public int LearnerCount { get; set; }
            public string InstitutionId { get; set; }
            public string RedeemedByUserId { get; set; }
            public string Status { get; set; }
            public DateTime RedeemedAt { get; set; }
            public DateTime CreatedAt { get; set; }
        }

        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse<VoucherResponse>>> CreateVoucher([FromBody] CreateVoucherRequest request)
        {
            try
            {
                // Validate denomination
                if (request.Denomination < 5 || request.Denomination > 50)
                {
                    return BadRequest(new ApiResponse<VoucherResponse>
                    {
                        Success = false,
                        Message = "Denomination must be between 5 and 50",
                        Data = null
                    });
                }

                // Use stored procedure to create voucher
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
                    return StatusCode(500, new ApiResponse<VoucherResponse>
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
                // Validate voucher code format
                if (!System.Text.RegularExpressions.Regex.IsMatch(request.VoucherCode, @"^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$"))
                {
                    return BadRequest(new ApiResponse<VoucherRedemptionResponse>
                    {
                        Success = false,
                        Message = "Invalid voucher code format. Must be XXXX-XXXX-XXXX-XXXX",
                        Data = null
                    });
                }

                // Use stored procedure to redeem voucher
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
                        Message = "Failed to redeem voucher. Please check the voucher code and try again.",
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
                var vouchers = await _context.Database.SqlQueryRaw<VoucherResponse>(
                    "SELECT * FROM dbo.vw_vouchers WHERE InstitutionId = @p0",
                    institutionId
                ).ToListAsync();

                return Ok(new ApiResponse<List<VoucherResponse>>
                {
                    Success = true,
                    Message = $"Found {vouchers.Count} vouchers for institution",
                    Data = vouchers
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<VoucherResponse>>
                {
                    Success = false,
                    Message = "An error occurred while retrieving vouchers",
                    Data = null,
                    Error = ex.Message
                });
            }
        }
    }
}
