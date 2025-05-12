namespace Ecocys.Admin.Core.Master
{
    public class Category
    {
        public int CategoryId { get; set; }
        public required string CategoryName { get; set; }
        public string? Description { get; set; }
        public required string ImageName { get; set; }
        public required string Level { get; set; }
        public int ParentCategoryId { get; set; }
        public bool IsDeleted { get; set; }
    }
}