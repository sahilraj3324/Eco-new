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
        public async Task<IActionResult> GetAllSubAdmins()
        {
            var subAdmins = await _context.SubAdmins.ToListAsync();
            // Convert to API format with RolesList
            var result = subAdmins.Select(s => new
            {
                s.Id,
                s.Name,
                s.Email,
                s.Phone,
                Roles = s.RolesList
            }).ToList();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubAdminById(Guid id)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();
            
            // Convert to API format with RolesList
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                Roles = subAdmin.RolesList
            };
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubAdmin([FromBody] SubAdminCreateRequest request)
        {
            var subAdmin = new SubAdmin
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Password = request.Password,
                RolesList = request.Roles ?? new List<string>()
            };
            
            _context.SubAdmins.Add(subAdmin);
            await _context.SaveChangesAsync();
            
            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                Roles = subAdmin.RolesList
            };
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubAdmin(Guid id, [FromBody] SubAdminCreateRequest request)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();

            subAdmin.Name = request.Name;
            subAdmin.Email = request.Email;
            subAdmin.Phone = request.Phone;
            subAdmin.Password = request.Password;
            subAdmin.RolesList = request.Roles ?? new List<string>();

            await _context.SaveChangesAsync();
            
            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                Roles = subAdmin.RolesList
            };
            return Ok(result);
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
                    Roles = subAdmin.RolesList
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

            var currentRoles = subAdmin.RolesList;
            if (!currentRoles.Contains(role))
            {
                currentRoles.Add(role);
                subAdmin.RolesList = currentRoles;
                await _context.SaveChangesAsync();
            }

            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                Roles = subAdmin.RolesList
            };
            return Ok(result);
        }

        [HttpDelete("{id}/roles/{role}")]
        public async Task<IActionResult> RemoveRoleFromSubAdmin(Guid id, string role)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();

            var currentRoles = subAdmin.RolesList;
            if (currentRoles.Contains(role))
            {
                currentRoles.Remove(role);
                subAdmin.RolesList = currentRoles;
                await _context.SaveChangesAsync();
            }

            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                Roles = subAdmin.RolesList
            };
            return Ok(result);
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

    // DTO for SubAdmin creation/update
    public class SubAdminCreateRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Password { get; set; }
        public List<string> Roles { get; set; }
    }
}
