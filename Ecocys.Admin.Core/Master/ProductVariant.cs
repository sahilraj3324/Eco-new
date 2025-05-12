using System.ComponentModel.DataAnnotations;

namespace Ecocys.Admin.Core.Master
{
    public class ProductVariant
    {
        [Key]
        public long VariantId { get; set; }
        public int CategoryId { get; set; }
        public long ProductId { get; set; }
        public required string VariantType { get; set; }
        public required string VariantValue { get; set; }
        public required string ImageName { get; set; }
        public int Stock { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public int DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ActualPrice { get; set; }
        public int CGSTPercentage { get; set; }
        public decimal CGSTAmount { get; set; }
        public int SGSTPercentage { get; set; }
        public decimal SGSTAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public bool IsDeleted { get; set; }
    }
}