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
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly EcoContext _context;
        private readonly IConfiguration _config;

        public AdminController(EcoContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // Admin Signup
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] AdminSignupRequest request)
        {
            // Check if admin already exists
            if (await _context.Admins.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Admin already exists" });

            // Hash the password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create the admin object
            var admin = new Admin
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                PasswordHash = hashedPassword,
                Phone = request.Phone,
                UserType = "Admin"
            };

            // Save to database
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();

            // Generate JWT token with no expiry
            var token = GenerateJwtTokenNoExpiry(admin.Id.ToString(), "Admin");

            // Set JWT in HTTP-only cookie
            SetJwtCookie(token);

            // Return admin info without token (since it's in cookie)
            return Ok(new
            {
                message = "Admin created successfully",
                admin = new
                {
                    admin.Id,
                    admin.Name,
                    admin.Email,
                    admin.Phone,
                    admin.UserType
                }
            });
        }

        // Admin Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Models.LoginRequest request)
        {
            var admin = await _context.Admins.FirstOrDefaultAsync(u => u.Email == request.Email);
            
            if (admin != null && BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
            {
                // Generate JWT token with no expiry
                var token = GenerateJwtTokenNoExpiry(admin.Id.ToString(), "Admin");
                
                // Set JWT in HTTP-only cookie
                SetJwtCookie(token);

                return Ok(new
                {
                    message = "Login successful",
                    admin = new
                    {
                        admin.Id,
                        admin.Name,
                        admin.Email,
                        admin.Phone,
                        admin.UserType
                    }
                });
            }

            return BadRequest(new { message = "Invalid credentials" });
        }

        // Admin Logout
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Clear the JWT cookie
            Response.Cookies.Delete("AdminToken");
            return Ok(new { message = "Logged out successfully" });
        }

        // Get all admins
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllAdmins()
        {
            var admins = await _context.Admins.Select(a => new {
                a.Id,
                a.Name,
                a.Email,
                a.Phone,
                a.UserType,
                a.CreatedAt
            }).ToListAsync();
            
            return Ok(admins);
        }

        // Get admin by ID
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetAdminById(Guid id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Admin not found" });
            
            return Ok(new {
                admin.Id,
                admin.Name,
                admin.Email,
                admin.Phone,
                admin.UserType,
                admin.CreatedAt
            });
        }

        // Update admin
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateAdmin(Guid id, [FromBody] UpdateAdminRequest request)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Admin not found" });

            admin.Name = request.Name ?? admin.Name;
            admin.Email = request.Email ?? admin.Email;
            admin.Phone = request.Phone ?? admin.Phone;

            if (!string.IsNullOrEmpty(request.Password))
            {
                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _context.SaveChangesAsync();
            
            return Ok(new {
                message = "Admin updated successfully",
                admin = new {
                    admin.Id,
                    admin.Name,
                    admin.Email,
                    admin.Phone,
                    admin.UserType
                }
            });
        }

        // Delete admin
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAdmin(Guid id)
        {
            var admin = await _context.Admins.FindAsync(id);
            if (admin == null) return NotFound(new { message = "Admin not found" });

            _context.Admins.Remove(admin);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Admin deleted successfully" });
        }

        // Verify current admin session
        [HttpGet("verify-session")]
        public async Task<IActionResult> VerifySession()
        {
            var token = Request.Cookies["AdminToken"];
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

                var admin = await _context.Admins.FindAsync(Guid.Parse(userId));
                if (admin == null)
                    return Unauthorized(new { message = "Invalid session" });

                return Ok(new
                {
                    message = "Session valid",
                    admin = new
                    {
                        admin.Id,
                        admin.Name,
                        admin.Email,
                        admin.Phone,
                        admin.UserType
                    }
                });
            }
            catch
            {
                return Unauthorized(new { message = "Invalid session" });
            }
        }

        // Generate JWT token with no expiry for admin
        private string GenerateJwtTokenNoExpiry(string userId, string userType)
        {
            var key = Encoding.UTF8.GetBytes("ThisIsAReallyLongSecretKeyForJWTThatIsAtLeast32CharactersLong!");
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { 
                    new Claim("id", userId),
                    new Claim("userType", userType)
                }),
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

            Response.Cookies.Append("AdminToken", token, cookieOptions);
        }
    }

    // Request models for Admin
    public class AdminSignupRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
    }

    public class UpdateAdminRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }
    }
}
