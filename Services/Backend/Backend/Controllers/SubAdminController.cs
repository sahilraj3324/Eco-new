using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Http;

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

        // SubAdmin Signup
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SubAdminSignupRequest request)
        {
            // Check if subadmin already exists
            if (await _context.SubAdmins.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "SubAdmin already exists" });

            // Hash the password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create the subadmin object
            var subAdmin = new SubAdmin
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = hashedPassword,
                Phone = request.Phone,
                UserType = "SubAdmin",
                RolesList = request.Roles ?? new List<string>() // Assign roles
            };

            // Save to database
            _context.SubAdmins.Add(subAdmin);
            await _context.SaveChangesAsync();

            // Generate JWT token with no expiry
            var token = GenerateJwtTokenNoExpiry(subAdmin.Id.ToString(), "SubAdmin", subAdmin.RolesList);

            // Set JWT in HTTP-only cookie
            SetJwtCookie(token);

            // Load assigned roles for response
            await LoadSubAdminRoles(subAdmin);

            // Return subadmin info without token (since it's in cookie)
            return Ok(new
            {
                message = "SubAdmin created successfully",
                subAdmin = new
                {
                    subAdmin.Id,
                    subAdmin.Name,
                    subAdmin.Email,
                    subAdmin.Phone,
                    subAdmin.UserType,
                    Roles = subAdmin.RolesList,
                    AccessibleTabs = subAdmin.AccessibleTabs
                }
            });
        }

        // SubAdmin Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Models.LoginRequest request)
        {
            var subAdmin = await _context.SubAdmins.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (subAdmin != null && BCrypt.Net.BCrypt.Verify(request.Password, subAdmin.PasswordHash))
            {
                // Load assigned roles
                await LoadSubAdminRoles(subAdmin);

                // Generate JWT token with no expiry and include roles
                var token = GenerateJwtTokenNoExpiry(subAdmin.Id.ToString(), "SubAdmin", subAdmin.RolesList);
                
                // Set JWT in HTTP-only cookie
                SetJwtCookie(token);

                return Ok(new
                {
                    message = "Login successful",
                    subAdmin = new
                    {
                        subAdmin.Id,
                        subAdmin.Name,
                        subAdmin.Email,
                        subAdmin.Phone,
                        subAdmin.UserType,
                        Roles = subAdmin.RolesList,
                        AccessibleTabs = subAdmin.AccessibleTabs
                    }
                });
            }

            return BadRequest(new { message = "Invalid credentials" });
        }

        // SubAdmin Logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Clear the JWT cookie
            Response.Cookies.Delete("SubAdminToken");
            return Ok(new { message = "Logged out successfully" });
        }

        // Get all subadmins
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllSubAdmins()
        {
            var subAdmins = await _context.SubAdmins.ToListAsync();
            
            // Load roles for each subadmin
            foreach (var subAdmin in subAdmins)
            {
                await LoadSubAdminRoles(subAdmin);
            }

            var result = subAdmins.Select(sa => new {
                sa.Id,
                sa.Name,
                sa.Email,
                sa.Phone,
                sa.UserType,
                Roles = sa.RolesList,
                AccessibleTabs = sa.AccessibleTabs,
                sa.CreatedAt
            });
            
            return Ok(result);
        }

        // Get subadmin by ID
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetSubAdminById(Guid id)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound(new { message = "SubAdmin not found" });
            
            // Load assigned roles
            await LoadSubAdminRoles(subAdmin);

            return Ok(new {
                subAdmin.Id,
                subAdmin.Name,
                subAdmin.Email,
                subAdmin.Phone,
                subAdmin.UserType,
                Roles = subAdmin.RolesList,
                AccessibleTabs = subAdmin.AccessibleTabs,
                subAdmin.CreatedAt
            });
        }

        // Update subadmin
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateSubAdmin(Guid id, [FromBody] UpdateSubAdminRequest request)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound(new { message = "SubAdmin not found" });

            subAdmin.Name = request.Name ?? subAdmin.Name;
            subAdmin.Email = request.Email ?? subAdmin.Email;
            subAdmin.Phone = request.Phone ?? subAdmin.Phone;

            if (request.Roles != null)
            {
                subAdmin.RolesList = request.Roles;
            }

            if (!string.IsNullOrEmpty(request.Password))
            {
                subAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _context.SaveChangesAsync();
            
            // Load updated roles
            await LoadSubAdminRoles(subAdmin);

            return Ok(new {
                message = "SubAdmin updated successfully",
                subAdmin = new {
                    subAdmin.Id,
                    subAdmin.Name,
                    subAdmin.Email,
                    subAdmin.Phone,
                    subAdmin.UserType,
                    Roles = subAdmin.RolesList,
                    AccessibleTabs = subAdmin.AccessibleTabs
                }
            });
        }

        // Update subadmin roles only
        [HttpPut("update-roles/{id}")]
        public async Task<IActionResult> UpdateSubAdminRoles(Guid id, [FromBody] UpdateRolesRequest request)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound(new { message = "SubAdmin not found" });

            subAdmin.RolesList = request.Roles ?? new List<string>();
            await _context.SaveChangesAsync();

            // Load updated roles
            await LoadSubAdminRoles(subAdmin);

            return Ok(new {
                message = "SubAdmin roles updated successfully",
                subAdmin = new {
                    subAdmin.Id,
                    subAdmin.Name,
                    subAdmin.Email,
                    Roles = subAdmin.RolesList,
                    AccessibleTabs = subAdmin.AccessibleTabs
                }
            });
        }

        // Delete subadmin
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteSubAdmin(Guid id)
        {
            var subAdmin = await _context.SubAdmins.FindAsync(id);
            if (subAdmin == null) return NotFound(new { message = "SubAdmin not found" });

            _context.SubAdmins.Remove(subAdmin);
            await _context.SaveChangesAsync();

            return Ok(new { message = "SubAdmin deleted successfully" });
        }

        // Verify current subadmin session
        [HttpGet("verify-session")]
        public async Task<IActionResult> VerifySession()
        {
            var token = Request.Cookies["SubAdminToken"];
            if (string.IsNullOrEmpty(token))
                return Unauthorized(new { message = "No session found" });

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes("ThisIsAReallyLongSecretKeyForJWTThatIsAtLeast32CharactersLong!");
                
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = false // No expiry for admin tokens
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userId = jwtToken.Claims.First(x => x.Type == "id").Value;
                var userType = jwtToken.Claims.First(x => x.Type == "userType").Value;

                var subAdmin = await _context.SubAdmins.FindAsync(Guid.Parse(userId));
                if (subAdmin == null)
                    return Unauthorized(new { message = "Invalid session" });

                // Load roles
                await LoadSubAdminRoles(subAdmin);

                return Ok(new
                {
                    message = "Session valid",
                    subAdmin = new
                    {
                        subAdmin.Id,
                        subAdmin.Name,
                        subAdmin.Email,
                        subAdmin.Phone,
                        subAdmin.UserType,
                        Roles = subAdmin.RolesList,
                        AccessibleTabs = subAdmin.AccessibleTabs
                    }
                });
            }
            catch
            {
                return Unauthorized(new { message = "Invalid session" });
            }
        }

        // Helper method to load roles for a subadmin
        private async Task LoadSubAdminRoles(SubAdmin subAdmin)
        {
            if (subAdmin.RolesList.Any())
            {
                var roleIds = subAdmin.RolesList.Where(r => Guid.TryParse(r, out _)).Select(Guid.Parse);
                subAdmin.AssignedRoles = await _context.Roles.Where(r => roleIds.Contains(r.Id)).ToListAsync();
            }
        }

        // Generate JWT token with no expiry for subadmin
        private string GenerateJwtTokenNoExpiry(string userId, string userType, List<string> roles)
        {
            var key = Encoding.UTF8.GetBytes("ThisIsAReallyLongSecretKeyForJWTThatIsAtLeast32CharactersLong!");
            var tokenHandler = new JwtSecurityTokenHandler();

            var claims = new List<Claim>
            {
                new Claim("id", userId),
                new Claim("userType", userType),
                new Claim("roles", string.Join(",", roles))
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                // No Expires property = no expiry
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Set JWT in HTTP-only cookie
        private void SetJwtCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,        // Prevent JavaScript access
                Secure = false,         // Set to true in production with HTTPS
                SameSite = SameSiteMode.Strict,
                Path = "/",
                // No expiry time for admin cookies
            };

            Response.Cookies.Append("SubAdminToken", token, cookieOptions);
        }
    }

    // Request models for SubAdmin
    public class SubAdminSignupRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
        public List<string> Roles { get; set; } = new List<string>();
    }

    public class UpdateSubAdminRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
        public List<string> Roles { get; set; }
    }

    public class UpdateRolesRequest
    {
        public List<string> Roles { get; set; } = new List<string>();
    }
}
