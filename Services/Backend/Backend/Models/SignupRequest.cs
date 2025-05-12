namespace Backend.Models
{
    public class SignupRequest
    {
        public string storename { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public long PhoneNumber { get; set; }
        public string Address { get; set; }
        public string UserType { get; set; }  // "Buyer" or "Seller"
        public string Gstnumber { get; set; }  // Only relevant for sellers
          // Store name for the seller
        public long pincode { get; set; }
        public string hnscode { get; set; }
        public string profile_picture { get; set; }
    }
}
