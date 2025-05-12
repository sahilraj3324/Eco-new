using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecocys.Admin.Core.Master
{
    public class Store
    {
        public long StoreId { get; set; }
        public required string StoreName { get; set; }
        public required string StoreType { get; set; }
        public required string OwnerName { get; set; }
        public required string Email { get; set; }
        public required string MobileNumber { get; set; }
        public string? AlternateMobileNumber { get; set; }
        public string? ImageName { get; set; }
        public string? BannerName { get; set; }
        public string? Description { get; set; }
        public bool IsOpen { get; set; } = true;
        public bool IsVerified { get; set; } = false;
        public string Status { get; set; } = "Active";
        public long CreatedBy { get; set; } = 0;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
    }
    public class StoreLocation
    {
        [Key]
        public long LocationId { get; set; }
        public long StoreId { get; set; } = 0;
        public required string Address { get; set; }
        public required string NearbyMarket { get; set; }
        public required string City { get; set; }
        public int PostalCode { get; set; }
        public int CityId { get; set; } = 0;

        [Column(TypeName = "decimal(9, 6)")]
        public decimal Latitude { get; set; }

        [Column(TypeName = "decimal(9, 6)")]
        public decimal Longitude { get; set; }
        public long CreatedBy { get; set; } = 0;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
    }
    public class StoreTiming
    {
        [Key]
        public long TimingId { get; set; }
        public long StoreId { get; set; } = 0;
        public required string OpeningDays { get; set; }
        public required string OpeningTime { get; set; }
        public required string ClosingTime { get; set; }
        public long CreatedBy { get; set; } = 0;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
    }
    public class StorePaymentDetail
    {
        public long PaymentId { get; set; }
        public long StoreId { get; set; } = 0;
        public required string BankName { get; set; }
        public required string AccountNumber { get; set; }
        public required string IFSCCode { get; set; }
        public string? GSTNumber { get; set; }
        public bool IsDefault { get; set; } = false;
        public long CreatedBy { get; set; } = 0;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
    }
}