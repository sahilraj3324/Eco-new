using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Linq;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ITwilioVerify _twilioVerify;
        private readonly IPasswordResetService _passwordResetService;
        private readonly EcoContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            ITwilioVerify twilioVerify, 
            IPasswordResetService passwordResetService,
            EcoContext context,
            IConfiguration configuration)
        {
            _twilioVerify = twilioVerify;
            _passwordResetService = passwordResetService;
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("forgot")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotDto model)
        {
            try
            {
                // Format phone number to E.164 format
                string formattedPhone = FormatPhoneNumber(model.PhoneNumber);
                if (string.IsNullOrEmpty(formattedPhone))
                {
                    return BadRequest(new { message = "Invalid phone number format. Please use format: +918102821863 or 8102821863" });
                }

                // Log for debugging
                Console.WriteLine($"🔍 DEBUG - Original phone: {model.PhoneNumber}");
                Console.WriteLine($"🔍 DEBUG - Formatted phone: {formattedPhone}");
                Console.WriteLine($"🔍 DEBUG - Portal: {model.Portal}");

                // Check if user exists based on portal type
                object user = null;
                Guid userId = Guid.Empty;
                
                switch (model.Portal.ToLower())
                {
                    case "retailer":
                        // Try multiple phone number formats to find user
                        var buyer = await _context.Buyers
                            .FirstOrDefaultAsync(b => 
                                b.PhoneNumber == formattedPhone || 
                                b.PhoneNumber == model.PhoneNumber ||
                                b.PhoneNumber == model.PhoneNumber.Replace("+91", "") ||
                                b.PhoneNumber == "91" + model.PhoneNumber ||
                                b.PhoneNumber == "+91" + model.PhoneNumber);
                        
                        if (buyer != null)
                        {
                            user = buyer;
                            userId = buyer.Id;
                            Console.WriteLine($"✅ DEBUG - Found buyer: {buyer.Email} with phone: {buyer.PhoneNumber}");
                        }
                        else
                        {
                            Console.WriteLine($"❌ DEBUG - No buyer found with phone number variants");
                            // Let's check what phone numbers exist in the database
                            var allBuyers = await _context.Buyers.Select(b => new { b.Email, b.PhoneNumber }).ToListAsync();
                            Console.WriteLine($"📋 DEBUG - All buyers in database:");
                            foreach (var b in allBuyers.Take(5)) // Show first 5 for debugging
                            {
                                Console.WriteLine($"   - {b.Email}: {b.PhoneNumber}");
                            }
                        }
                        break;
                        
                    case "vendor":
                        var seller = await _context.Sellers
                            .FirstOrDefaultAsync(s => 
                                s.PhoneNumber == formattedPhone || 
                                s.PhoneNumber == model.PhoneNumber ||
                                s.PhoneNumber == model.PhoneNumber.Replace("+91", "") ||
                                s.PhoneNumber == "91" + model.PhoneNumber ||
                                s.PhoneNumber == "+91" + model.PhoneNumber);
                        
                        if (seller != null)
                        {
                            user = seller;
                            userId = seller.Id;
                            Console.WriteLine($"✅ DEBUG - Found seller: {seller.Email} with phone: {seller.PhoneNumber}");
                        }
                        else
                        {
                            Console.WriteLine($"❌ DEBUG - No seller found with phone number variants");
                        }
                        break;
                        
                    case "admin":
                        // Check both Admins and SubAdmins tables
                        var admin = await _context.Admins
                            .FirstOrDefaultAsync(a => 
                                a.Phone == formattedPhone || 
                                a.Phone == model.PhoneNumber ||
                                a.Phone == model.PhoneNumber.Replace("+91", "") ||
                                a.Phone == "91" + model.PhoneNumber ||
                                a.Phone == "+91" + model.PhoneNumber);
                        
                        if (admin != null)
                        {
                            user = admin;
                            userId = admin.Id;
                            Console.WriteLine($"✅ DEBUG - Found admin: {admin.Email} with phone: {admin.Phone}");
                        }
                        else
                        {
                            // Check SubAdmins if admin not found
                            var subAdmin = await _context.SubAdmins
                                .FirstOrDefaultAsync(sa => 
                                    sa.Phone == formattedPhone || 
                                    sa.Phone == model.PhoneNumber ||
                                    sa.Phone == model.PhoneNumber.Replace("+91", "") ||
                                    sa.Phone == "91" + model.PhoneNumber ||
                                    sa.Phone == "+91" + model.PhoneNumber);
                            
                            if (subAdmin != null)
                            {
                                user = subAdmin;
                                userId = subAdmin.Id;
                                Console.WriteLine($"✅ DEBUG - Found subadmin: {subAdmin.Email} with phone: {subAdmin.Phone}");
                            }
                            else
                            {
                                Console.WriteLine($"❌ DEBUG - No admin or subadmin found with phone number variants");
                            }
                        }
                        break;
                        
                    default:
                        return BadRequest(new { message = "Invalid portal type" });
                }

                if (user == null)
                {
                    // Don't reveal if user exists or not for security
                    return Ok(new { message = "If the phone number is registered, you will receive an OTP" });
                }

                // Send OTP using formatted phone number
                await _twilioVerify.SendAsync(formattedPhone);
                
                return Ok(new { message = "OTP sent successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("verify")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyDto model)
        {
            try
            {
                // Format phone number to E.164 format
                string formattedPhone = FormatPhoneNumber(model.PhoneNumber);
                if (string.IsNullOrEmpty(formattedPhone))
                {
                    return BadRequest(new { message = "Invalid phone number format" });
                }

                // Verify OTP with Twilio
                var verifyResult = await _twilioVerify.CheckAsync(formattedPhone, model.Code);
                
                if (!verifyResult)
                {
                    return BadRequest(new { message = "Invalid or expired OTP" });
                }

                // Find user based on portal type
                Guid userId = Guid.Empty;
                
                switch (model.Portal.ToLower())
                {
                    case "retailer":
                        var buyer = await _context.Buyers
                            .FirstOrDefaultAsync(b => 
                                b.PhoneNumber == formattedPhone || 
                                b.PhoneNumber == model.PhoneNumber ||
                                b.PhoneNumber == model.PhoneNumber.Replace("+91", "") ||
                                b.PhoneNumber == "91" + model.PhoneNumber ||
                                b.PhoneNumber == "+91" + model.PhoneNumber);
                        if (buyer != null) userId = buyer.Id;
                        break;
                        
                    case "vendor":
                        var seller = await _context.Sellers
                            .FirstOrDefaultAsync(s => 
                                s.PhoneNumber == formattedPhone || 
                                s.PhoneNumber == model.PhoneNumber ||
                                s.PhoneNumber == model.PhoneNumber.Replace("+91", "") ||
                                s.PhoneNumber == "91" + model.PhoneNumber ||
                                s.PhoneNumber == "+91" + model.PhoneNumber);
                        if (seller != null) userId = seller.Id;
                        break;
                        
                    case "admin":
                        // Check both Admins and SubAdmins tables
                        var admin = await _context.Admins
                            .FirstOrDefaultAsync(a => 
                                a.Phone == formattedPhone || 
                                a.Phone == model.PhoneNumber ||
                                a.Phone == model.PhoneNumber.Replace("+91", "") ||
                                a.Phone == "91" + model.PhoneNumber ||
                                a.Phone == "+91" + model.PhoneNumber);
                        if (admin != null) 
                        {
                            userId = admin.Id;
                        }
                        else
                        {
                            var subAdmin = await _context.SubAdmins
                                .FirstOrDefaultAsync(sa => 
                                    sa.Phone == formattedPhone || 
                                    sa.Phone == model.PhoneNumber ||
                                    sa.Phone == model.PhoneNumber.Replace("+91", "") ||
                                    sa.Phone == "91" + model.PhoneNumber ||
                                    sa.Phone == "+91" + model.PhoneNumber);
                            if (subAdmin != null) userId = subAdmin.Id;
                        }
                        break;
                }

                if (userId == Guid.Empty)
                {
                    return BadRequest(new { message = "User not found" });
                }

                // Generate password reset token
                var resetToken = await _passwordResetService.GenerateResetTokenAsync(userId, model.Portal);
                
                return Ok(new { 
                    message = "OTP verified successfully", 
                    resetToken = resetToken.Token,
                    expiresAt = resetToken.ExpiresAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetDto model)
        {
            try
            {
                // Validate reset token
                var tokenValid = await _passwordResetService.ValidateResetTokenAsync(model.ResetToken);
                
                if (!tokenValid.IsValid)
                {
                    return BadRequest(new { message = tokenValid.ErrorMessage });
                }

                var resetTokenEntity = tokenValid.Token;
                
                // Update password based on portal type
                switch (resetTokenEntity.Portal.ToLower())
                {
                    case "retailer":
                        var buyer = await _context.Buyers.FindAsync(resetTokenEntity.UserId);
                        if (buyer != null)
                        {
                            buyer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                            await _context.SaveChangesAsync();
                        }
                        break;
                        
                    case "vendor":
                        var seller = await _context.Sellers.FindAsync(resetTokenEntity.UserId);
                        if (seller != null)
                        {
                            seller.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                            await _context.SaveChangesAsync();
                        }
                        break;
                        
                    case "admin":
                        // Try to find in Admins table first
                        var admin = await _context.Admins.FindAsync(resetTokenEntity.UserId);
                        if (admin != null)
                        {
                            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                            await _context.SaveChangesAsync();
                        }
                        else
                        {
                            // Try SubAdmins table
                            var subAdmin = await _context.SubAdmins.FindAsync(resetTokenEntity.UserId);
                            if (subAdmin != null)
                            {
                                subAdmin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                                await _context.SaveChangesAsync();
                            }
                            else
                            {
                                return BadRequest(new { message = "Admin user not found" });
                            }
                        }
                        break;
                        
                    default:
                        return BadRequest(new { message = "Invalid portal type" });
                }

                // Mark token as used
                await _passwordResetService.MarkTokenAsUsedAsync(model.ResetToken);

                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Formats phone number to E.164 format for Twilio
        /// Supports Indian (+91) and US (+1) formats
        /// </summary>
        private string FormatPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                return string.Empty;

            // Remove all non-digit characters
            string digitsOnly = new string(phoneNumber.Where(char.IsDigit).ToArray());

            // Handle different cases
            if (digitsOnly.Length == 10)
            {
                // Indian number without country code: 8102821863 -> +918102821863
                // Assuming Indian numbers by default for 10-digit numbers
                return "+91" + digitsOnly;
            }
            else if (digitsOnly.Length == 11 && digitsOnly.StartsWith("1"))
            {
                // US number with country code: 11234567890 -> +11234567890
                return "+" + digitsOnly;
            }
            else if (digitsOnly.Length == 12 && digitsOnly.StartsWith("91"))
            {
                // Indian number with country code: 918102821863 -> +918102821863
                return "+" + digitsOnly;
            }
            else if (phoneNumber.StartsWith("+") && digitsOnly.Length >= 10)
            {
                // Already formatted with + sign
                return "+" + digitsOnly;
            }

            // For other international numbers or invalid formats
            return string.Empty;
        }
    }
} 