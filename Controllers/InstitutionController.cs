// File: Controllers/InstitutionController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PscTechBackend.Data;
using PscTechBackend.Models;
using System.ComponentModel.DataAnnotations;

namespace PscTechBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstitutionController : ControllerBase
    {
        private readonly PscTechDbContext _context;

        public InstitutionController(PscTechDbContext context)
        {
            _context = context;
        }

        // ==== DTOs ====
        public class RegisterInstitutionRequest
        {
            [Required, StringLength(255)]
            public string Name { get; set; } = string.Empty;

            // Optional; if not supplied we generate one
            [StringLength(50)]
            public string? Code { get; set; }

            [EmailAddress, StringLength(255)]
            public string? Email { get; set; }

            [StringLength(20)]
            public string? Phone { get; set; }

            [StringLength(500)]
            public string? Address { get; set; }
        }

        public class UpdateInstitutionRequest
        {
            [Required, StringLength(255)]
            public string Name { get; set; } = string.Empty;

            [StringLength(50)]
            public string? Code { get; set; }

            [EmailAddress, StringLength(255)]
            public string? Email { get; set; }

            [StringLength(20)]
            public string? Phone { get; set; }

            [StringLength(500)]
            public string? Address { get; set; }
        }

        public class ApiResponse<T>
        {
            public bool Success { get; set; }
            public T? Data { get; set; }
            public string Message { get; set; } = "";
            public string? Error { get; set; }
        }

        // Health / ping
        [HttpGet("test")]
        public IActionResult Test() => Ok(new { message = "Institution API OK", timestamp = DateTime.UtcNow });

        // Create
        [HttpPost("register")]
        public async Task<ActionResult<ApiResponse<Institution>>> Register([FromBody] RegisterInstitutionRequest req)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<Institution>
                {
                    Success = false,
                    Message = "Invalid request",
                    Error = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                });
            }

            // Generate Code when missing
            var code = string.IsNullOrWhiteSpace(req.Code)
                ? $"SCH{Random.Shared.Next(100000, 999999)}"
                : req.Code.Trim().ToUpperInvariant();

            // Unique checks
            if (await _context.Institutions.AnyAsync(i => i.Code == code))
            {
                return BadRequest(new ApiResponse<Institution>
                {
                    Success = false,
                    Message = $"Institution code '{code}' already exists."
                });
            }
            if (!string.IsNullOrWhiteSpace(req.Email) &&
                await _context.Institutions.AnyAsync(i => i.Email == req.Email))
            {
                return BadRequest(new ApiResponse<Institution>
                {
                    Success = false,
                    Message = $"An institution with email '{req.Email}' already exists."
                });
            }

            var entity = new Institution
            {
                Name = req.Name.Trim(),
                Code = code,
                Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim(),
                Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim(),
                Address = string.IsNullOrWhiteSpace(req.Address) ? null : req.Address.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Institutions.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<Institution>
            {
                Success = true,
                Message = "Institution registered",
                Data = entity
            });
        }

        // List (paged)
        [HttpGet]
        public async Task<ActionResult<ApiResponse<object>>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 25)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Institutions.AsNoTracking().OrderByDescending(i => i.CreatedAt);
            var total = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { total, page, pageSize, items },
                Message = "OK"
            });
        }

        // Get by id
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<Institution>>> Get(int id)
        {
            var entity = await _context.Institutions.FindAsync(id);
            if (entity == null)
                return NotFound(new ApiResponse<Institution> { Success = false, Message = "Not found" });

            return Ok(new ApiResponse<Institution> { Success = true, Data = entity });
        }

        // Update
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse<Institution>>> Update(int id, [FromBody] UpdateInstitutionRequest req)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<Institution>
                {
                    Success = false,
                    Message = "Invalid request",
                    Error = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                });
            }

            var entity = await _context.Institutions.FindAsync(id);
            if (entity == null)
                return NotFound(new ApiResponse<Institution> { Success = false, Message = "Not found" });

            // Unique checks (if changing Code or Email)
            if (!string.IsNullOrWhiteSpace(req.Code))
            {
                var newCode = req.Code.Trim().ToUpperInvariant();
                if (!string.Equals(newCode, entity.Code, StringComparison.OrdinalIgnoreCase) &&
                    await _context.Institutions.AnyAsync(i => i.Code == newCode && i.Id != id))
                {
                    return BadRequest(new ApiResponse<Institution> { Success = false, Message = $"Code '{newCode}' already exists." });
                }
                entity.Code = newCode;
            }

            if (!string.IsNullOrWhiteSpace(req.Email))
            {
                var newEmail = req.Email.Trim();
                if (!string.Equals(newEmail, entity.Email, StringComparison.OrdinalIgnoreCase) &&
                    await _context.Institutions.AnyAsync(i => i.Email == newEmail && i.Id != id))
                {
                    return BadRequest(new ApiResponse<Institution> { Success = false, Message = $"Email '{newEmail}' already exists." });
                }
                entity.Email = newEmail;
            }
            else
            {
                entity.Email = null;
            }

            entity.Name = req.Name.Trim();
            entity.Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim();
            entity.Address = string.IsNullOrWhiteSpace(req.Address) ? null : req.Address.Trim();
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<Institution> { Success = true, Message = "Updated", Data = entity });
        }

        // Delete
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
        {
            var entity = await _context.Institutions.FindAsync(id);
            if (entity == null)
                return NotFound(new ApiResponse<object> { Success = false, Message = "Not found" });

            _context.Institutions.Remove(entity);
            await _context.SaveChangesAsync();
            return Ok(new ApiResponse<object> { Success = true, Message = "Deleted" });
        }
    }
}
