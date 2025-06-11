using Backend.Models;

namespace Backend.Services
{
    public interface IPasswordResetService
    {
        Task<PasswordResetToken> GenerateResetTokenAsync(Guid userId, string portal);
        Task<(bool IsValid, string ErrorMessage, PasswordResetToken Token)> ValidateResetTokenAsync(string resetToken);
        Task MarkTokenAsUsedAsync(string resetToken);
    }
} 