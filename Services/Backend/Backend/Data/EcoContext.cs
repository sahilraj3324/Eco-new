using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class EcoContext : DbContext
    {
        public EcoContext(DbContextOptions<EcoContext> options) : base(options) { }

        public DbSet<Buyer> Buyers { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<AskAdmin> AskAdmins { get; set; }
        public DbSet<Admin> Admins { get; set; }
        public DbSet<SubAdmin> SubAdmins { get; set; }
        public DbSet<ReviewRating> ReviewRatings { get; set; }
        public DbSet<ImageStore> ImageStores { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure ReviewRating Images property with proper value comparer
            modelBuilder.Entity<ReviewRating>()
                .Property(r => r.Images)
                .HasConversion(
                    v => string.Join(";", v),
                    v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                )
                .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()));

            // Configure decimal properties with proper precision and scale
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.UnitPrice)
                .HasColumnType("decimal(18,2)");

            // Configure ImageStore entity
            modelBuilder.Entity<ImageStore>()
                .Property(i => i.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }

        //public DbSet<Cart> Carts { get; set; }
    }
}
