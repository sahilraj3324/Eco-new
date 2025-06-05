using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Admin
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Phone { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string UserType { get; set; } = "Admin";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
