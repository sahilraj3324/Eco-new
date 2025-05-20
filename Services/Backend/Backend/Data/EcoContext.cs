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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ReviewRating>()
                .Property(r => r.Images)
                .HasConversion(
                    v => string.Join(";", v),
                    v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
        }


        //public DbSet<Cart> Carts { get; set; }


    }
}
