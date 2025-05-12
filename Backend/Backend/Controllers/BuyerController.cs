using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Models;

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

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] Buyer buyer)
        {
            if (await _context.Buyers.AnyAsync(b => b.Email == buyer.Email))
                return BadRequest(new { message = "Buyer already exists" });

            buyer.Id = Guid.NewGuid().ToString();
            buyer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(buyer.PasswordHash);

            _context.Buyers.Add(buyer);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(buyer.Id);
            return Ok(new { token, buyerId = buyer.Id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var buyer = await _context.Buyers.FirstOrDefaultAsync(b => b.Email == request.Email);
            if (buyer == null || !BCrypt.Net.BCrypt.Verify(request.Password, buyer.PasswordHash))
                return BadRequest(new { message = "Invalid credentials" });

            var token = GenerateJwtToken(buyer.Id);
            return Ok(new { token, buyerId = buyer.Id });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBuyer(string id)
        {
            var buyer = await _context.Buyers.FindAsync(id);
            if (buyer == null) return NotFound(new { message = "Buyer not found" });
            return Ok(buyer);
        }

        private string GenerateJwtToken(string buyerId)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim("id", buyerId) }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
