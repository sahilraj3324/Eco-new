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
    }
}