using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class UpdateSellerAllFieldsRequest
    {
        public string? storename { get; set; }
        
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? Email { get; set; }
        
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
        public string? Password { get; set; }
        
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Phone number must be exactly 10 digits and start with 6, 7, 8, or 9")]
        public string? PhoneNumber { get; set; }
        
        public string? Address { get; set; }
        
        [RegularExpression(@"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", ErrorMessage = "Invalid GST number format")]
        public string? GstNumber { get; set; }
        
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Pincode must be exactly 6 digits")]
        public string? pincode { get; set; }
        
        public string? hnscode { get; set; }
        public string? profile_picture { get; set; }
    }
} 