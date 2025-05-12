using System.ComponentModel.DataAnnotations;

namespace Ecocys.Admin.Core.Account
{
    public class StoreAndPickupDetails
    {
        [Key]
        public long StoreId { get; set; }
        public required string StoreName { get; set; }
        public string? DisplayName { get; set; }
        public string? StoreDescription { get; set; }
        public required string FullName { get; set; }
        public required string SignatureImage { get; set; }
        public int PickupPincode { get; set; }
        public bool AgreedTAndC { get; set; }
        public bool IsDeleted { get; set; }
    }
    public class BankDetails
    {
        [Key]
        public long BankId { get; set; }
        public required string AccountNumber { get; set; }
        public required string IFSCCode { get; set; }
        public bool IsDeleted { get; set; }
    }
}