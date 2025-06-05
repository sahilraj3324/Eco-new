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
        public string PasswordHash { get; set; }

        public string UserType { get; set; } = "SubAdmin";

        // Map to the actual database column name "Role" (singular) - now stores Role IDs
        [Required]
        [Column("Role")]
        public string Roles { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Helper property to work with List<string> in API for Role IDs
        [NotMapped]
        public List<string> RolesList 
        { 
            get => string.IsNullOrEmpty(Roles) ? new List<string>() : Roles.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();
            set => Roles = string.Join(";", value ?? new List<string>());
        }

        // Navigation property for related roles (not mapped to database)
        [NotMapped]
        public List<Role> AssignedRoles { get; set; } = new List<Role>();

        // Helper property to get tabs from assigned roles
        [NotMapped]
        public List<string> AccessibleTabs 
        { 
            get 
            {
                var tabs = new List<string>();
                foreach (var role in AssignedRoles)
                {
                    tabs.AddRange(role.Tabs);
                }
                return tabs.Distinct().ToList();
            }
        }
    }
}
