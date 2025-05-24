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
    public class AdminController : ControllerBase
    {
        private readonly EcoContext _context;
        private readonly IConfiguration _config;

        public AdminController(EcoContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var admin = await _context.Admins
                .FirstOrDefaultAsync(a => a.Email == request.Email && a.Password == request.Password);

            if (admin == null)
                return Unauthorized(new { message = "Invalid credentials" });

            var token = GenerateJwtToken(admin.Id.ToString());

            return Ok(new
            {
                token,
                admin = new
                {
                    admin.Id,
                    admin.Name,
                    admin.Email,
                    admin.Phone
                }
            });
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
