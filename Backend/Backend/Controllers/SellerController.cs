using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellerController : ControllerBase
    {
        private readonly EcoContext _context;
        private static List<User> users = new List<User>(); // In-memory storage

        private readonly IConfiguration _config;

        public SellerController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("signup")]
        public IActionResult Signup([FromBody] SignupRequest request)
        {
            // Check if user already exists
            if (users.Any(u => u.Email == request.Email))
                return BadRequest(new { message = "User already exists" });

            // Hash password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create user
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Username = request.Username,
                Email = request.Email,
                PasswordHash = hashedPassword
            };
            users.Add(user);

            // Generate JWT
            var token = GenerateJwtToken(user.Id);

            return Ok(new { token, userId = user.Id });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest(new { message = "Invalid credentials" });

            var token = GenerateJwtToken(user.Id);

            return Ok(new { token, userId = user.Id });
        }

        [HttpGet("users")]
        public IActionResult GetAllUsers()
        {
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public IActionResult GetUserById(string id)
        {
            var user = users.FirstOrDefault(u => u.Id == id);
            if (user == null) return NotFound(new { message = "User not found" });
            return Ok(user);
        }

        [HttpPut("users/{id}")]
        public IActionResult UpdateUser(string id, [FromBody] UpdateUserRequest request)
        {
            var user = users.FirstOrDefault(u => u.Id == id);
            if (user == null) return NotFound(new { message = "User not found" });

            user.Email = request.Email ?? user.Email;

            if (!string.IsNullOrEmpty(request.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            }

            return Ok(user);
        }

        [HttpDelete("users/{id}")]
        public IActionResult DeleteUser(string id)
        {
            var user = users.FirstOrDefault(u => u.Id == id);
            if (user == null) return NotFound(new { message = "User not found" });

            users.Remove(user);
            return Ok(new { message = "User deleted successfully" });
        }

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

    public class User
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
    }

    // Request Models
    public class SignupRequest
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public long Phonenumber { get; set; }
        public string address { get; set; }
        public int Pincode { get; set; }
        public string UserType { get; set; }
        public string Photo { get; set; }
        public string Gstnumber { get; set; }
        public string Tradename { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class UpdateUserRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
