using System.ComponentModel.DataAnnotations;

namespace Ecocys.Admin.Core.Master
{
    public class User
    {
        public long UserId { get; set; }
        public required string UserType { get; set; }
        public string UserName { get; set; } = "User";
        public string ISDCode { get; set; } = "+91";
        public required string Mobile { get; set; }
        public bool IsMobileVerified { get; set; } = false;
        public string? MobileOTP { get; set; }
        public DateTime? MOTPExpiryOn { get; set; }
        public string? Email { get; set; }
        public bool IsEmailVerified { get; set; } = false;
        public bool TaxVerified { get; set; } = false;
        public bool StoreVerified { get; set; } = false;
        public bool BankVerified { get; set; } = false;
        public string? EmailOTP { get; set; }
        public DateTime? EOTPExpiryOn { get; set; }
        public required byte[] Password { get; set; }
        public string Status { get; set; } = "Active";
        public long CreatedBy { get; set; } = 0;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
    }
    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
    public class LoginResponse
    {
        [Key]
        public long UserId { get; set; }
        public required string Email { get; set; }
        public required string Mobile { get; set; }
    }
    public class OTPHistory
    {
        [Key]
        public long OTPId { get; set; }
        public required string OTP { get; set; }
        public required string OTPOn { get; set; }
        public required string OTPContact { get; set; }
        public DateTime OTPSentOn { get; set; }
        public int OTPExpiryMinute { get; set; }
        public DateTime OTPExpiryOn { get => OTPSentOn.AddMinutes(OTPExpiryMinute); }
    }
}