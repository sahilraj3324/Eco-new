using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class AppUser : IdentityUser<Guid>
    {
        public string Portal { get; set; } = string.Empty; // "Admin", "Vendor", "Retailer"
    }
} 