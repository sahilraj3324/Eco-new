using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class SignupRequest
    {
        [Required(ErrorMessage = "Store name is required")]
        [JsonPropertyName("storename")]
        public string storename { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [JsonPropertyName("email")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
        [JsonPropertyName("password")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Phone number must be exactly 10 digits and start with 6, 7, 8, or 9")]
        [JsonPropertyName("phoneNumber")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage = "Address is required")]
        [JsonPropertyName("address")]
        public string Address { get; set; }

        [JsonPropertyName("userType")]
        public string UserType { get; set; }  // "Buyer" or "Seller"

        [Required(ErrorMessage = "GST number is required")]
        [JsonPropertyName("gstnumber")]
        // Temporarily allowing dummy GST for testing - in production, use the full GST regex
        // [RegularExpression(@"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", ErrorMessage = "Invalid GST number format")]
        public string Gstnumber { get; set; }  // Only relevant for sellers

        [Required(ErrorMessage = "Pincode is required")]
        [RegularExpression(@"^\d{6}$", ErrorMessage = "Pincode must be exactly 6 digits")]
        [JsonPropertyName("pincode")]
        public string pincode { get; set; }

        [Required(ErrorMessage = "HSN code is required")]
        [JsonPropertyName("hnscode")]
        public string hnscode { get; set; }

        [JsonPropertyName("profile_picture")]
        public string profile_picture { get; set; }
    }
}
