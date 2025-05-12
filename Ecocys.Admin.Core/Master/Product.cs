namespace Ecocys.Admin.Core.Master
{
    public class Product
    {
        public long ProductId { get; set; }
        public int CategoryId { get; set; }
        public string? ProductCode { get; set; }
        public required string ProductName { get; set; }
        public required string VariantType { get; set; }
        public required string VariantValue { get; set; }
        public string? CompanyName { get; set; }
        public string? Description { get; set; }
        public int WeightInGrams { get; set; }
        public required string ImageName { get; set; }
        public int Stock { get; set; }
        public int Quantity { get; set; }
        public decimal MRP { get; set; }
        public decimal Price { get; set; }
        public int DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal ActualPrice { get; set; }
        public int GSTPercentage { get; set; }
        public decimal GSTAmount { get; set; }
        public decimal FinalPrice { get; set; }
        public bool IsDeleted { get; set; }
    }
}