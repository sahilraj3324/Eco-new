using System.ComponentModel.DataAnnotations;

namespace Ecocys.Admin.Core.Master
{
    public class UserRole
    {
        [Key]
        public int RoleId { get; set; }
        public required string RoleName { get; set; }
        public long CreatedBy { get; set; } = 0;
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
    }
}