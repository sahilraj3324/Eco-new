using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubAdminController : ControllerBase
    {
        private readonly EcoContext _context;

        public SubAdminController(EcoContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSubAdmins() =>
            Ok(await _context.SubAdmins.ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubAdminById(Guid id)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            return subAdmin == null ? NotFound() : Ok(subAdmin);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubAdmin([FromBody] SubAdmin subAdmin)
        {
            subAdmin.Id = Guid.NewGuid();
            _context.SubAdmins.Add(subAdmin);
            await _context.SaveChangesAsync();
            return Ok(subAdmin);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubAdmin(Guid id, [FromBody] SubAdmin updated)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();

            subAdmin.Name = updated.Name;
            subAdmin.Email = updated.Email;
            subAdmin.Phone = updated.Phone;
            subAdmin.Password = updated.Password;
            subAdmin.Role = updated.Role;

            await _context.SaveChangesAsync();
            return Ok(subAdmin);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubAdmin(Guid id)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();

            _context.SubAdmins.Remove(subAdmin);
            await _context.SaveChangesAsync();
            return Ok(new { message = "SubAdmin deleted." });
        }
    }
}
