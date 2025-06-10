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

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellerController : ControllerBase
    {
        private readonly EcoContext _context;
        private readonly IConfiguration _config;

        public SellerController(EcoContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // Sign up Seller
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupRequest request)
        {
            // 🔒 Check if seller already exists
            if (await _context.Sellers.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Seller already exists" });

            // 🔐 Hash the password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // 🧾 Create the seller object
            var seller = new Seller
            {
                Id = Guid.NewGuid(),
                storename = request.storename,
                Email = request.Email,
                PasswordHash = hashedPassword,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                GstNumber = request.Gstnumber,
                UserType = "Vendor",
                pincode = request.pincode,
                hnscode = request.hnscode,
                profile_picture = request.profile_picture,
                Status = "InReview", // 👈 Default status
            };

            // 💾 Save to database
            _context.Sellers.Add(seller);
            await _context.SaveChangesAsync();

            // 🔑 Generate JWT token
            var token = GenerateJwtToken(seller.Id.ToString());

            // 🍪 Set token in cookie
            SetTokenCookie(token);

            // ✅ Return full seller info + token
            return Ok(new
            {
                token,
                seller = new
                {
                    seller.Id,
                    seller.storename,
                    seller.Email,
                    seller.PhoneNumber,
                    seller.Address,
                    seller.GstNumber,
                    seller.UserType,
                    seller.pincode,
                    seller.hnscode,
                    seller.profile_picture,
                    seller.Status
                }
            });
        }


        // Login Seller
        [HttpPost("login")]
        public IActionResult Login([FromBody] Models.LoginRequest request)
        {
            // First, check if the user exists as a Buyer
            

            // If not found as a Buyer, check if the user exists as a Seller
            var seller = _context.Sellers.FirstOrDefault(u => u.Email == request.Email);
            if (seller != null && BCrypt.Net.BCrypt.Verify(request.Password, seller.PasswordHash))
            {
                var token = GenerateJwtToken(seller.Id.ToString());
                
                // 🍪 Set token in cookie
                SetTokenCookie(token);
                
                return Ok(new
                {
                    token,
                    seller = new
                    {
                        seller.Id,
                        seller.storename,
                        seller.Email,
                        seller.PhoneNumber,
                        seller.Address,
                        seller.GstNumber,
                        seller.UserType,
                        seller.pincode,
                        seller.hnscode,
                        seller.profile_picture,
                        seller.Status,
                        seller.CreatedAt
                    }
                });
            }
            var buyer = _context.Buyers.FirstOrDefault(u => u.Email == request.Email);
            if (buyer != null && BCrypt.Net.BCrypt.Verify(request.Password, buyer.PasswordHash))
            {
                var token = GenerateJwtToken(buyer.Id.ToString());
                return Ok("You are regestered as Buyer Ask Admin to make changes");
            }

            return BadRequest(new { message = "Invalid credentials" });
        }



        // Get all sellers
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllSellers()
        {
            var sellers = await _context.Sellers.ToListAsync();
            return Ok(sellers);
        }

        // Get seller by ID
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetSellerById(Guid id)
        {
            var seller = await _context.Sellers.FindAsync(id);
            if (seller == null) return NotFound(new { message = "Seller not found" });
            return Ok(seller);
        }

        // Update seller
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateSeller(Guid id, [FromBody] UpdateUserRequest request)
        {
            var seller = await _context.Sellers.FindAsync(id);
            if (seller == null) return NotFound(new { message = "Seller not found" });

            seller.Email = request.Email ?? seller.Email;

            if (!string.IsNullOrEmpty(request.Password))
            {
                seller.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            await _context.SaveChangesAsync();
            return Ok(seller);
        }

        [HttpPut("update-status/{id}")]
        public async Task<IActionResult> UpdateSellerStatus(Guid id, [FromBody] UpdateStatusRequest request)
        {
            var seller = await _context.Sellers.FindAsync(id);
            if (seller == null)
                return NotFound(new { message = "Seller not found." });

            var validStatuses = new[] { "InReview", "Approved", "Not Approved" };

            if (!validStatuses.Contains(request.Status))
                return BadRequest(new { message = $"Invalid status. Must be one of: {string.Join(", ", validStatuses)}" });

            seller.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Seller status updated to '{request.Status}'." });
            
        }

        // Update all seller fields
        [HttpPut("update-all-fields/{id}")]
        public async Task<IActionResult> UpdateSellerAllFields(Guid id, [FromBody] UpdateSellerAllFieldsRequest request)
        {
            var seller = await _context.Sellers.FindAsync(id);
            if (seller == null)
                return NotFound(new { message = "Seller not found" });

            // Update string fields
            seller.storename = request.storename ?? seller.storename;
            seller.Email = request.Email ?? seller.Email;
            seller.Address = request.Address ?? seller.Address;
            seller.GstNumber = request.GstNumber ?? seller.GstNumber;
            seller.hnscode = request.hnscode ?? seller.hnscode;
            seller.profile_picture = request.profile_picture ?? seller.profile_picture;

            // Update phone number and pincode as strings
            seller.PhoneNumber = request.PhoneNumber ?? seller.PhoneNumber;
            seller.pincode = request.pincode ?? seller.pincode;

            // Update password if provided
            if (!string.IsNullOrEmpty(request.Password))
            {
                seller.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new
                {
                    message = "Seller updated successfully",
                    seller = new
                    {
                        seller.Id,
                        seller.storename,
                        seller.Email,
                        seller.PhoneNumber,
                        seller.Address,
                        seller.GstNumber,
                        seller.UserType,
                        seller.pincode,
                        seller.hnscode,
                        seller.profile_picture,
                        seller.Status
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error updating seller", error = ex.Message });
            }
        }

        // Delete seller
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteSeller(Guid id)
        {
            var seller = await _context.Sellers.FindAsync(id);
            if (seller == null) return NotFound(new { message = "Seller not found" });

            _context.Sellers.Remove(seller);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Seller deleted successfully" });
        }

        // Get current user from cookie token
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var token = Request.Cookies["token"];
            if (string.IsNullOrEmpty(token))
                return Unauthorized(new { message = "No token found in cookies" });

            try
            {
                var userId = ValidateTokenAndGetUserId(token);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Invalid token" });

                var seller = await _context.Sellers.FindAsync(Guid.Parse(userId));
                if (seller == null)
                    return NotFound(new { message = "Seller not found" });

                return Ok(new
                {
                    seller = new
                    {
                        seller.Id,
                        seller.storename,
                        seller.Email,
                        seller.PhoneNumber,
                        seller.Address,
                        seller.GstNumber,
                        seller.UserType,
                        seller.pincode,
                        seller.hnscode,
                        seller.profile_picture,
                        seller.Status,
                        seller.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Token validation failed", error = ex.Message });
            }
        }

        // Logout - clear cookie
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("token");
            return Ok(new { message = "Logged out successfully" });
        }

        // Generate JWT token
        private string GenerateJwtToken(string userId)
        {
            var key = Encoding.UTF8.GetBytes("ThisIsAReallyLongSecretKeyForJWTThatIsAtLeast32CharactersLong!"); // 32+ characters
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
                Secure = false, // Set to true in production with HTTPS
                SameSite = SameSiteMode.Strict
            };
            Response.Cookies.Append("token", token, cookieOptions);
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
