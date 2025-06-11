namespace Backend.Services
{
    public interface ITwilioVerify
    {
        Task SendAsync(string phone);
        Task<bool> CheckAsync(string phone, string code);
    }
} 