using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuyerController : ControllerBase
    {
        private readonly EcoContext _context;
        private readonly IConfiguration _config;

        public BuyerController(EcoContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // Sign up Buyer
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupRequest request)
        {
            if (await _context.Buyers.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Buyer already exists" });

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var buyer = new Buyer
            {
                Id = Guid.NewGuid(),
                storename = request.storename,
                Email = request.Email,
                PasswordHash = hashedPassword,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                GstNumber = request.Gstnumber,
                UserType = "Buyer",
                pincode = request.pincode,
                hnscode = request.hnscode,
                profile_picture = request.profile_picture
            };
            _context.Buyers.Add(buyer);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(buyer.Id.ToString());
            
            // Set token in cookie
            SetTokenCookie(token);

            return Ok(new
            {
                token,
                buyer = new
                {
                    buyer.Id,
                    buyer.storename,
                    buyer.Email,
                    buyer.PhoneNumber,
                    buyer.Address,
                    buyer.GstNumber,
                    buyer.UserType,
                    buyer.pincode,
                    buyer.hnscode,
                    buyer.profile_picture
                }
            });
        }

        // Login Buyer
        [HttpPost("login")]
        public IActionResult Login([FromBody] Models.LoginRequest request)
        {
            var buyer = _context.Buyers.FirstOrDefault(u => u.Email == request.Email);
            if (buyer != null && BCrypt.Net.BCrypt.Verify(request.Password, buyer.PasswordHash))
            {
                var token = GenerateJwtToken(buyer.Id.ToString());
                
                // Set token in cookie
                SetTokenCookie(token);
                
                return Ok(new
                {
                    token,
                    buyer = new
                    {
                        buyer.Id,
                        buyer.storename,
                        buyer.Email,
                        buyer.PhoneNumber,
                        buyer.Address,
                        buyer.GstNumber,
                        buyer.UserType,
                        buyer.pincode,
                        buyer.hnscode,
                        buyer.profile_picture
                    }
                });
            }

            return BadRequest(new { message = "Invalid credentials" });
        }

        // Logout Buyer
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("token");
            return Ok(new { message = "Logged out successfully" });
        }

        // Get all buyers
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllBuyers()
        {
            var buyers = await _context.Buyers.ToListAsync();
            return Ok(buyers);
        }

        // Get buyer by ID
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetBuyerById(Guid id)
        {
            var buyer = await _context.Buyers.FindAsync(id);
            if (buyer == null) return NotFound(new { message = "Buyer not found" });
            return Ok(buyer);
        }

        // Update buyer
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateBuyer(Guid id, [FromBody] UpdateUserRequest request)
        {
            var buyer = await _context.Buyers.FindAsync(id);
            if (buyer == null) return NotFound(new { message = "Buyer not found" });

            buyer.Email = request.Email ?? buyer.Email;

            if (!string.IsNullOrEmpty(request.Password))
            {
                buyer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _context.SaveChangesAsync();
            return Ok(buyer);
        }

        // Delete buyer
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteBuyer(Guid id)
        {
            var buyer = await _context.Buyers.FindAsync(id);
            if (buyer == null) return NotFound(new { message = "Buyer not found" });

            _context.Buyers.Remove(buyer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Buyer deleted successfully" });
        }

        // Get current user from cookie token
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            Console.WriteLine("=== GetCurrentUser endpoint called ===");
            Console.WriteLine($"Request URL: {Request.Scheme}://{Request.Host}{Request.Path}{Request.QueryString}");
            Console.WriteLine($"Request method: {Request.Method}");
            Console.WriteLine($"Request origin: {Request.Headers["Origin"].FirstOrDefault() ?? "No Origin"}");
            Console.WriteLine($"Request user-agent: {Request.Headers["User-Agent"].FirstOrDefault() ?? "No User-Agent"}");
            Console.WriteLine($"Request referer: {Request.Headers["Referer"].FirstOrDefault() ?? "No Referer"}");
            
            // Log all cookies received
            var allCookies = Request.Cookies.ToList();
            Console.WriteLine($"Total cookies received: {allCookies.Count}");
            if (allCookies.Count == 0)
            {
                Console.WriteLine("⚠️  WARNING: No cookies received at all!");
            }
            else
            {
                foreach (var cookie in allCookies)
                {
                    Console.WriteLine($"Cookie: {cookie.Key} = {cookie.Value?.Substring(0, Math.Min(10, cookie.Value?.Length ?? 0))}...");
                }
            }
            
            // Log all headers for debugging
            Console.WriteLine("All request headers:");
            foreach (var header in Request.Headers)
            {
                Console.WriteLine($"  {header.Key}: {header.Value}");
            }
            
            var token = Request.Cookies["token"];
            Console.WriteLine($"Token cookie value: {(string.IsNullOrEmpty(token) ? "NULL/EMPTY" : token.Substring(0, 10) + "...")}");
            
            if (string.IsNullOrEmpty(token))
            {
                Console.WriteLine("❌ No token found in cookies - returning Unauthorized");
                return Unauthorized(new { message = "No token found in cookies" });
            }

            try
            {
                Console.WriteLine("Attempting to validate token...");
                var userId = ValidateTokenAndGetUserId(token);
                Console.WriteLine($"Token validation result - UserId: {userId ?? "NULL"}");
                
                if (string.IsNullOrEmpty(userId))
                {
                    Console.WriteLine("❌ Token validation failed - returning Unauthorized");
                    return Unauthorized(new { message = "Invalid token" });
                }

                Console.WriteLine($"Looking up buyer with ID: {userId}");
                var buyer = await _context.Buyers.FindAsync(Guid.Parse(userId));
                if (buyer == null)
                {
                    Console.WriteLine("❌ Buyer not found in database");
                    return NotFound(new { message = "Buyer not found" });
                }

                Console.WriteLine($"✅ Successfully found buyer: {buyer.Email}");
                return Ok(new
                {
                    buyer = new
                    {
                        buyer.Id,
                        buyer.storename,
                        buyer.Email,
                        buyer.PhoneNumber,
                        buyer.Address,
                        buyer.GstNumber,
                        buyer.UserType,
                        buyer.pincode,
                        buyer.hnscode,
                        buyer.profile_picture
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Exception in GetCurrentUser: {ex.Message}");
                Console.WriteLine($"Full exception: {ex}");
                return BadRequest(new { message = "Token validation failed", error = ex.Message });
            }
        }

        // Test endpoint to verify backend is working
        [HttpGet("test")]
        public IActionResult Test()
        {
            Console.WriteLine("=== Test endpoint called ===");
            
            var allCookies = Request.Cookies.ToList();
            Console.WriteLine($"Total cookies received: {allCookies.Count}");
            foreach (var cookie in allCookies)
            {
                Console.WriteLine($"Cookie: {cookie.Key} = {cookie.Value}");
            }
            
            return Ok(new
            {
                message = "Backend is working!",
                timestamp = DateTime.UtcNow,
                cookies = allCookies.ToDictionary(c => c.Key, c => c.Value),
                headers = Request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString())
            });
        }

        // Generate JWT token
        private string GenerateJwtToken(string userId)
        {
            var key = Encoding.UTF8.GetBytes("ThisIsAReallyLongSecretKeyForJWTThatIsAtLeast32CharactersLong!");
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

        // Set token in HTTP-only cookie
        private void SetTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddHours(1),
                Secure = false, // Must be false for localhost development
                SameSite = SameSiteMode.Lax, // Lax is better for localhost development
                Path = "/",
                Domain = null // Let browser determine domain
            };

            Console.WriteLine($"Setting token cookie: {token.Substring(0, Math.Min(10, token.Length))}...");
            Console.WriteLine($"Cookie options: HttpOnly={cookieOptions.HttpOnly}, Secure={cookieOptions.Secure}, SameSite={cookieOptions.SameSite}, Path={cookieOptions.Path}");
            
            // Set the main token cookie
            Response.Cookies.Append("token", token, cookieOptions);
            
            Console.WriteLine("Token cookie set successfully");
        }

        // Validate token and extract user ID
        private string ValidateTokenAndGetUserId(string token)
        {
            try
            {
                var key = Encoding.UTF8.GetBytes("ThisIsAReallyLongSecretKeyForJWTThatIsAtLeast32CharactersLong!");
                var tokenHandler = new JwtSecurityTokenHandler();
                
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal.FindFirst("id")?.Value;
            }
            catch
            {
                return null;
            }
        }
    }
}