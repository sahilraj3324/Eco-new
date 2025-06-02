using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Backend.Models
{
    public class Role
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Column("TabsString")]
        public string TabsString { get; set; } = "";

        // Helper property to work with List<string> in API
        [NotMapped]
        public List<string> Tabs 
        { 
            get => string.IsNullOrEmpty(TabsString) ? new List<string>() : TabsString.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();
            set => TabsString = string.Join(";", value ?? new List<string>());
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 