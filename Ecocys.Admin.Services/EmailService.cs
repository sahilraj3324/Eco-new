using Ecocys.Admin.Core;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace Ecocys.Admin.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var host = _configuration["SmtpConfig:Host"];
            var username = _configuration["SmtpConfig:Username"];
            var password = _configuration["SmtpConfig:Password"];
            var port = int.Parse(_configuration["SmtpConfig:Port"] ?? "0");
            var enableSsl = bool.Parse(_configuration["SmtpConfig:EnableSsl"] ?? "false");
            try
            {
                using (var client = new SmtpClient(host, port))
                {
                    client.EnableSsl = enableSsl;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(username, password);
                    var message = new MailMessage(username ?? "", to) { Subject = subject, Body = body, IsBodyHtml = true };
                    await client.SendMailAsync(message);
                }
            }
            catch (Exception ex)
            {
                ex.ToString();
                throw;
            }
        }
    }
}
