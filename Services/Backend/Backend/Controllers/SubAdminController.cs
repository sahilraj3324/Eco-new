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
            
            // Fetch all roles to get accessible tabs
            var allRoles = await _context.Roles.ToListAsync();
            
            var result = subAdmins.Select(s => {
                var roleIds = s.RolesList;
                var assignedRoles = allRoles.Where(r => roleIds.Contains(r.Id.ToString())).ToList();
                var accessibleTabs = assignedRoles.SelectMany(r => r.Tabs).Distinct().ToList();
                
                return new
                {
                    s.Id,
                    s.Name,
                    s.Email,
                    s.Phone,
                    UserType = "subadmin",
                    Roles = s.RolesList,
                    AccessibleTabs = accessibleTabs,
                    AssignedRoles = assignedRoles.Select(r => new { r.Id, r.Name, r.Tabs }).ToList()
                };
            }).ToList();
            
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubAdminById(Guid id)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();
            
            // Fetch the actual Role objects to get accessible tabs
            var roleIds = subAdmin.RolesList;
            var assignedRoles = new List<Role>();
            var accessibleTabs = new List<string>();

            if (roleIds.Any())
            {
                assignedRoles = await _context.Roles
                    .Where(r => roleIds.Contains(r.Id.ToString()))
                    .ToListAsync();

                // Extract all tabs from assigned roles
                accessibleTabs = assignedRoles.SelectMany(r => r.Tabs).Distinct().ToList();
            }
            
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                UserType = "subadmin",
                Roles = subAdmin.RolesList,
                AccessibleTabs = accessibleTabs,
                AssignedRoles = assignedRoles.Select(r => new { r.Id, r.Name, r.Tabs }).ToList()
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
            
            // Fetch the actual Role objects to get accessible tabs
            var roleIds = subAdmin.RolesList;
            var assignedRoles = new List<Role>();
            var accessibleTabs = new List<string>();

            if (roleIds.Any())
            {
                assignedRoles = await _context.Roles
                    .Where(r => roleIds.Contains(r.Id.ToString()))
                    .ToListAsync();

                // Extract all tabs from assigned roles
                accessibleTabs = assignedRoles.SelectMany(r => r.Tabs).Distinct().ToList();
            }
            
            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                UserType = "subadmin",
                Roles = subAdmin.RolesList,
                AccessibleTabs = accessibleTabs,
                AssignedRoles = assignedRoles.Select(r => new { r.Id, r.Name, r.Tabs }).ToList()
            };
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubAdmin(Guid id, [FromBody] SubAdminCreateRequest request)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();

            // Update all fields
            subAdmin.Name = request.Name;
            subAdmin.Email = request.Email;
            subAdmin.Phone = request.Phone;
            if (!string.IsNullOrEmpty(request.Password))
            {
                subAdmin.Password = request.Password;
            }
            subAdmin.RolesList = request.Roles ?? new List<string>();

            await _context.SaveChangesAsync();
            
            // Fetch the actual Role objects to get accessible tabs
            var roleIds = subAdmin.RolesList;
            var assignedRoles = new List<Role>();
            var accessibleTabs = new List<string>();

            if (roleIds.Any())
            {
                assignedRoles = await _context.Roles
                    .Where(r => roleIds.Contains(r.Id.ToString()))
                    .ToListAsync();

                // Extract all tabs from assigned roles
                accessibleTabs = assignedRoles.SelectMany(r => r.Tabs).Distinct().ToList();
            }
            
            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                UserType = "subadmin",
                Roles = subAdmin.RolesList,
                AccessibleTabs = accessibleTabs,
                AssignedRoles = assignedRoles.Select(r => new { r.Id, r.Name, r.Tabs }).ToList()
            };
            return Ok(result);
        }

        [HttpPut("{id}/roles")]
        public async Task<IActionResult> UpdateSubAdminRoles(Guid id, [FromBody] List<string> roles)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound();

            subAdmin.RolesList = roles ?? new List<string>();
            await _context.SaveChangesAsync();
            
            // Fetch the actual Role objects to get accessible tabs
            var roleIds = subAdmin.RolesList;
            var assignedRoles = new List<Role>();
            var accessibleTabs = new List<string>();

            if (roleIds.Any())
            {
                assignedRoles = await _context.Roles
                    .Where(r => roleIds.Contains(r.Id.ToString()))
                    .ToListAsync();

                // Extract all tabs from assigned roles
                accessibleTabs = assignedRoles.SelectMany(r => r.Tabs).Distinct().ToList();
            }
            
            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                UserType = "subadmin",
                Roles = subAdmin.RolesList,
                AccessibleTabs = accessibleTabs,
                AssignedRoles = assignedRoles.Select(r => new { r.Id, r.Name, r.Tabs }).ToList()
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

            // Fetch the actual Role objects to get accessible tabs
            var roleIds = subAdmin.RolesList;
            var assignedRoles = new List<Role>();
            var accessibleTabs = new List<string>();

            if (roleIds.Any())
            {
                assignedRoles = await _context.Roles
                    .Where(r => roleIds.Contains(r.Id.ToString()))
                    .ToListAsync();

                // Extract all tabs from assigned roles
                foreach (var role in assignedRoles)
                {
                    accessibleTabs.AddRange(role.Tabs);
                }
                
                // Remove duplicates
                accessibleTabs = accessibleTabs.Distinct().ToList();
            }

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
                    UserType = "subadmin",
                    Roles = subAdmin.RolesList,
                    AccessibleTabs = accessibleTabs,
                    AssignedRoles = assignedRoles.Select(r => new { r.Id, r.Name, r.Tabs }).ToList()
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

            // Fetch the actual Role objects to get accessible tabs
            var roleIds = subAdmin.RolesList;
            var assignedRoles = new List<Role>();
            var accessibleTabs = new List<string>();

            if (roleIds.Any())
            {
                assignedRoles = await _context.Roles
                    .Where(r => roleIds.Contains(r.Id.ToString()))
                    .ToListAsync();

                // Extract all tabs from assigned roles
                accessibleTabs = assignedRoles.SelectMany(r => r.Tabs).Distinct().ToList();
            }

            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                UserType = "subadmin",
                Roles = subAdmin.RolesList,
                AccessibleTabs = accessibleTabs,
                AssignedRoles = assignedRoles.Select(r => new { r.Id, r.Name, r.Tabs }).ToList()
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

            // Fetch the actual Role objects to get accessible tabs
            var roleIds = subAdmin.RolesList;
            var assignedRoles = new List<Role>();
            var accessibleTabs = new List<string>();

            if (roleIds.Any())
            {
                assignedRoles = await _context.Roles
                    .Where(r => roleIds.Contains(r.Id.ToString()))
                    .ToListAsync();

                // Extract all tabs from assigned roles
                accessibleTabs = assignedRoles.SelectMany(r => r.Tabs).Distinct().ToList();
            }

            // Return API format
            var result = new
            {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                UserType = "subadmin",
                Roles = subAdmin.RolesList,
                AccessibleTabs = accessibleTabs,
                AssignedRoles = assignedRoles.Select(r => new { r.Id, r.Name, r.Tabs }).ToList()
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
