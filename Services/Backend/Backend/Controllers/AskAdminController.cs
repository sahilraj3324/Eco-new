using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AskAdminController : ControllerBase
    {
        private readonly EcoContext _context;

        public AskAdminController(EcoContext context)
        {
            _context = context;
        }

        // POST: api/AskAdmin
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AskAdmin request)
        {
            request.Id = Guid.NewGuid();
            request.CreatedAt = DateTime.UtcNow;
            _context.AskAdmins.Add(request);
            await _context.SaveChangesAsync();
            return Ok(request);
        }

        // GET: api/AskAdmin
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.AskAdmins.ToListAsync();
            return Ok(list);
        }

        // GET: api/AskAdmin/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUser(string userId)
        {
            var list = await _context.AskAdmins
                .Where(x => x.UserId == userId)
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/AskAdmin/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var record = await _context.AskAdmins.FindAsync(id);
            if (record == null)
                return NotFound();

            return Ok(record);
        }

        // PUT: api/AskAdmin/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] AskAdmin update)
        {
            var existing = await _context.AskAdmins.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Question = update.Question;
            existing.Answer = update.Answer;
            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        // DELETE: api/AskAdmin/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var record = await _context.AskAdmins.FindAsync(id);
            if (record == null)
                return NotFound();

            _context.AskAdmins.Remove(record);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Deleted successfully." });
        }
    }
}
