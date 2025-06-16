using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Banner
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public List<string> Image1 { get; set; } = new List<string>();

        public List<string> Image2 { get; set; } = new List<string>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
} 