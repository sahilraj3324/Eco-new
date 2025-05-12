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
                UserType = "Seller",
                pincode = request.pincode,
                hnscode = request.hnscode,
                profile_picture = request.profile_picture
            };

            // 💾 Save to database
            _context.Sellers.Add(seller);
            await _context.SaveChangesAsync();

            // 🔑 Generate JWT token
            var token = GenerateJwtToken(seller.Id.ToString());

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
                    seller.profile_picture
                }
            });
        }


        // Login Seller
        [HttpPost("login")]
        public IActionResult Login([FromBody] Models.LoginRequest request)
        {
            // First, check if the user exists as a Buyer
            var buyer = _context.Buyers.FirstOrDefault(u => u.Email == request.Email);
            if (buyer != null && BCrypt.Net.BCrypt.Verify(request.Password, buyer.PasswordHash))
            {
                var token = GenerateJwtToken(buyer.Id.ToString());
                return Ok(new { token, userId = buyer.Id, userType = "Buyer" });
            }

            // If not found as a Buyer, check if the user exists as a Seller
            var seller = _context.Sellers.FirstOrDefault(u => u.Email == request.Email);
            if (seller != null && BCrypt.Net.BCrypt.Verify(request.Password, seller.PasswordHash))
            {
                var token = GenerateJwtToken(seller.Id.ToString());
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
                        seller.profile_picture
                    }
                });
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
    }
}
