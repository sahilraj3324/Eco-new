namespace Ecocys.Admin.Core.Master
{
    public class Location
    {
        public int LocationId { get; set; }
        public required string LocationName { get; set; }
        public required string LocationType { get; set; }
        public int? ParentLocationId { get; set; }
        public long CreatedBy { get; set; } = 0;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
    }
    public class City
    {
        public int CityId { get; set; }
        public required string CityName { get; set; }
    }
}