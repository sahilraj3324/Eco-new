using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Backend.Models
{
    public class SubAdmin
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
        public string Password { get; set; }

        // Map to the actual database column name "Role" (singular)
        [Required]
        [Column("Role")]
        public string Roles { get; set; } = "";

        // Helper property to work with List<string> in API
        [NotMapped]
        public List<string> RolesList 
        { 
            get => string.IsNullOrEmpty(Roles) ? new List<string>() : Roles.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();
            set => Roles = string.Join(";", value ?? new List<string>());
        }
    }
}
