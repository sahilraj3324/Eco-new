using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly EcoContext _db;

        public PasswordResetService(EcoContext db)
        {
            _db = db;
        }

        public async Task<PasswordResetToken> GenerateResetTokenAsync(Guid userId, string portal)
        {
            var token = new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Portal = portal,
                Token = Guid.NewGuid().ToString("N")[..8].ToUpper(), // Short 8-char token
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                Used = false
            };
            
            _db.PasswordResetTokens.Add(token);
            await _db.SaveChangesAsync();
            return token;
        }

        public async Task<(bool IsValid, string ErrorMessage, PasswordResetToken Token)> ValidateResetTokenAsync(string resetToken)
        {
            var token = await _db.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == resetToken && !t.Used);
                
            if (token == null)
            {
                return (false, "Invalid or already used reset token", null);
            }
            
            if (token.ExpiresAt < DateTime.UtcNow)
            {
                return (false, "Reset token has expired", null);
            }
            
            return (true, string.Empty, token);
        }

        public async Task MarkTokenAsUsedAsync(string resetToken)
        {
            var token = await _db.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.Token == resetToken);
                
            if (token != null)
            {
                token.Used = true;
                await _db.SaveChangesAsync();
            }
        }
    }
} 