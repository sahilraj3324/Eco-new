using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class UpdateSellerAllFieldsRequest
    {
        public string? storename { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public long? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? GstNumber { get; set; }
        public long? pincode { get; set; }
        public string? hnscode { get; set; }
        public string? profile_picture { get; set; }
    }
} 