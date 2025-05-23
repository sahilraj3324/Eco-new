using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class ImageStore
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Image1 { get; set; }

        [Required]
        public string Image2 { get; set; }

        public string Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
} 