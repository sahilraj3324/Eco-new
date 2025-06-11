using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class PasswordResetToken
    {
        [Key]
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Portal { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Token { get; set; } = string.Empty;
        
        public DateTime ExpiresAt { get; set; }
        public bool Used { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 