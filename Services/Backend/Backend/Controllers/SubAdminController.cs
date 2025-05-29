using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubAdminController : ControllerBase
    {
        private readonly EcoContext _context;
        private readonly IConfiguration _config;

        public SubAdminController(EcoContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
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
            subAdmin.Roles = updated.Roles;

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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var subAdmin = await _context.SubAdmins
                .FirstOrDefaultAsync(s => s.Email == request.Email && s.Password == request.Password);

            if (subAdmin == null)
                return Unauthorized(new { message = "Invalid credentials" });

            var token = GenerateJwtToken(subAdmin.Id.ToString());

            return Ok(new
            {
                token,
                subAdmin = new
                {
                    subAdmin.Id,
                    subAdmin.Name,
                    subAdmin.Email,
                    subAdmin.Phone,
                    subAdmin.Roles
                }
            });
        }

        [HttpPost("{id}/roles")]
        public async Task<IActionResult> AddRoleToSubAdmin(Guid id, [FromBody] string role)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();

            if (string.IsNullOrWhiteSpace(role))
                return BadRequest("Role cannot be empty");

            if (!subAdmin.Roles.Contains(role))
            {
                subAdmin.Roles.Add(role);
                await _context.SaveChangesAsync();
            }

            return Ok(subAdmin);
        }

        [HttpDelete("{id}/roles/{role}")]
        public async Task<IActionResult> RemoveRoleFromSubAdmin(Guid id, string role)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();

            if (subAdmin.Roles.Contains(role))
            {
                subAdmin.Roles.Remove(role);
                await _context.SaveChangesAsync();
            }

            return Ok(subAdmin);
        }

        private string GenerateJwtToken(string userId)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "ThisIsAReallyLongSecretKeyForJWTThatIsAtLeast32CharactersLong!");
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim("id", userId) }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
