using Twilio;
using Twilio.Rest.Verify.V2.Service;

namespace Backend.Services
{
    public class TwilioVerify : ITwilioVerify
    {
        private readonly string _sid, _token, _service;

        public TwilioVerify(IConfiguration cfg)
        {
            _sid = cfg["Twilio:AccountSid"] ?? throw new ArgumentException("Twilio AccountSid not configured");
            _token = cfg["Twilio:AuthToken"] ?? throw new ArgumentException("Twilio AuthToken not configured");
            _service = cfg["Twilio:VerifySid"] ?? throw new ArgumentException("Twilio VerifySid not configured");
            TwilioClient.Init(_sid, _token);
        }

        public Task SendAsync(string phone)
        {
            return VerificationResource.CreateAsync(to: phone, channel: "sms", pathServiceSid: _service);
        }

        public async Task<bool> CheckAsync(string phone, string code)
        {
            var result = await VerificationCheckResource.CreateAsync(
                to: phone, code: code, pathServiceSid: _service);
            return result.Status == "approved";
        }
    }
} 