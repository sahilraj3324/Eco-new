using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class EcoContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
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
        public DbSet<Role> CustomRoles { get; set; }
        public DbSet<ReviewRating> ReviewRatings { get; set; }
        public DbSet<ImageStore> ImageStores { get; set; }

        // New entities for password reset
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal precision for price fields
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.UnitPrice)
                .HasPrecision(18, 2);

            // Configure SubAdmin Roles list conversion - commented out since Roles is now string
            // modelBuilder.Entity<SubAdmin>()
            //     .Property(s => s.Roles)
            //     .HasConversion(
            //         v => string.Join(";", v),
            //         v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
            //     );

            modelBuilder.Entity<ReviewRating>()
                .Property(r => r.Images)
                .HasConversion(
                    v => string.Join(";", v),
                    v => v.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList()
                )
                .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                ));

            // Configure ImageStore entity
            modelBuilder.Entity<ImageStore>()
                .Property(i => i.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            // Configure PasswordResetToken index
            modelBuilder.Entity<PasswordResetToken>()
                .HasIndex(p => p.UserId);

            // Configure custom Role entity to use the original table name
            modelBuilder.Entity<Role>()
                .ToTable("Roles");

            // Configure Identity tables with custom prefixes to avoid conflicts
            modelBuilder.Entity<AppUser>().ToTable("AspNetUsers");
            modelBuilder.Entity<IdentityRole<Guid>>().ToTable("AspNetRoles");
            modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("AspNetUserRoles");
            modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("AspNetUserClaims");
            modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("AspNetUserLogins");
            modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("AspNetRoleClaims");
            modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("AspNetUserTokens");
        }


        //public DbSet<Cart> Carts { get; set; }


    }
}
