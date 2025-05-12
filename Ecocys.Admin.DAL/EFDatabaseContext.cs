using Ecocys.Admin.Core.Account;
using Ecocys.Admin.Core.Master;
using Microsoft.EntityFrameworkCore;

namespace Ecocys.Admin.DAL
{
    public class EFDatabaseContext : DbContext
    {
        public EFDatabaseContext(DbContextOptions<EFDatabaseContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<StoreAndPickupDetails> StoreAndPickupDetails { get; set; }
        public DbSet<BankDetails> BankDetails { get; set; }
        public DbSet<LoginResponse> LoginResponse { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<StoreLocation> StoreLocations { get; set; }
        public DbSet<StoreTiming> StoreTimings { get; set; }
        public DbSet<OTPHistory> OTPHistory { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }
    }
}