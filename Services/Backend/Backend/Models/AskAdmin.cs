using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class AskAdmin
    {
        [Key]
    public Guid Id { get; set; }

    [Required]
    public string UserId { get; set; }

    [Required]
    public string UserName { get; set; }

    [Required]
    public string Question { get; set; }

    public string Answer { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
