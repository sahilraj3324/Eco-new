using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Retailler
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid(); // Auto-generate unique ID

        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public long Phonenumber { get; set; }
        public string address { get; set; }
        public int Pincode { get; set; }
        public string UserType { get; set; }
        public string Photo { get; set; }
        public string Gstnumber { get; set; }
        public string Tradename { get; set; }
    }
}
