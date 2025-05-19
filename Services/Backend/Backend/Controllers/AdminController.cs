using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly EcoContext _context;

        public AdminController(EcoContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAdmins() =>
            Ok(await _context.Admins.ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAdminById(Guid id)
        {
            var admin = await _context.Admins.FindAsync(id);
            return admin == null ? NotFound() : Ok(admin);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAdmin([FromBody] Admin admin)
        {
            admin.Id = Guid.NewGuid();
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
            return Ok(admin);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAdmin(Guid id, [FromBody] Admin updated)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null) return NotFound();

            admin.Name = updated.Name;
            admin.Email = updated.Email;
            admin.Phone = updated.Phone;
            admin.Password = updated.Password;

            await _context.SaveChangesAsync();
            return Ok(admin);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null) return NotFound();

            _context.Admins.Remove(admin);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Admin deleted." });
        }
    }
}
