using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class SubCategory
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string SubCategoryName { get; set; }

        [Required]
        public Guid CategoryId { get; set; }

    }
}
