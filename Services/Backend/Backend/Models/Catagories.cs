using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Category
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string CategoryName { get; set; }
    }
}
