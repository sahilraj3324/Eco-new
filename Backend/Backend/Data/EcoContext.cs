using Backend.Controllers;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class EcoContext : DbContext
    {
        public EcoContext(DbContextOptions<EcoContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Retailler> Sellers { get; set; }  // Corrected spelling
        public DbSet<Buyer> Buyers { get; set; }      // Corrected spelling
        public DbSet<User> Users { get; set; }        // Added Users DbSet for authentication
    }
}