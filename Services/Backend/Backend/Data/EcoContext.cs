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
            // Configure decimal precision for price fields
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.UnitPrice)
                .HasPrecision(18, 2);

            // Configure SubAdmin Roles list conversion
            modelBuilder.Entity<SubAdmin>()
                .Property(s => s.Roles)
                .HasConversion(
                    v => string.Join(";", v),
                    v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            modelBuilder.Entity<ReviewRating>()
                .Property(r => r.Images)
                .HasConversion(
                    v => string.Join(";", v),
                    v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            // Configure ImageStore entity
            modelBuilder.Entity<ImageStore>()
                .Property(i => i.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }


        //public DbSet<Cart> Carts { get; set; }


    }
}
