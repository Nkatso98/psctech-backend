using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PscTechBackend.Data;
using PscTechBackend.Models;

namespace PscTechBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LearnersController : ControllerBase
    {
        private readonly PscTechDbContext _dbContext;

        public LearnersController(PscTechDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Learner>>> GetAll()
        {
            var learners = await _dbContext.Learners.AsNoTracking().ToListAsync();
            return Ok(learners);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Learner>> GetById(Guid id)
        {
            var learner = await _dbContext.Learners.FindAsync(id);
            if (learner == null)
            {
                return NotFound();
            }
            return Ok(learner);
        }

        [HttpPost]
        public async Task<ActionResult<Learner>> Create([FromBody] Learner learner)
        {
            _dbContext.Learners.Add(learner);
            await _dbContext.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = learner.Id }, learner);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Learner learner)
        {
            if (id != learner.Id)
            {
                return BadRequest();
            }

            _dbContext.Entry(learner).State = EntityState.Modified;
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _dbContext.Learners.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            _dbContext.Learners.Remove(existing);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}





