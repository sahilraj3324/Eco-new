using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Seller
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string storename { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Phone number must be exactly 10 digits and start with 6, 7, 8, or 9")]
        public string PhoneNumber { get; set; }

        public string Address { get; set; }

        public string GstNumber { get; set; }  // GST number for sellers

        public string UserType { get; set; }  // For example, "Seller"

        [RegularExpression(@"^\d{6}$", ErrorMessage = "Pincode must be exactly 6 digits")]
        public string pincode { get; set; }
        
        public string hnscode { get; set; }

        public string profile_picture { get; set; }
        public string Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
