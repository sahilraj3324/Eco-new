namespace Backend.Models
{
    public record ForgotDto(string PhoneNumber, string Portal);
    public record VerifyDto(string PhoneNumber, string Code, string Portal);
    public record ResetDto(string ResetToken, string NewPassword);
} 