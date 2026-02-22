using Microsoft.EntityFrameworkCore;
using GroceryApi.Models;

namespace GroceryApi.Data
{
    public class GroceryContext : DbContext
    {
        public GroceryContext(DbContextOptions<GroceryContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<SystemSettings> SystemSettings { get; set; }
        public DbSet<FeatureToggles> FeatureToggles { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure timestamp columns to use timezone-aware type (timestamptz)
            modelBuilder.Entity<Sale>()
                .Property(s => s.CreatedAt)
                .HasColumnType("timestamp with time zone");

            modelBuilder.Entity<Sale>()
                .HasMany(s => s.Items)
                .WithOne()
                .HasForeignKey(si => si.SaleId);

            modelBuilder.Entity<ActivityLog>()
                .Property(a => a.Timestamp)
                .HasColumnType("timestamp with time zone");

            modelBuilder.Entity<ActivityLog>()
                .Property(a => a.RevertedAt)
                .HasColumnType("timestamp with time zone");

            // configure supplier relationship for products
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany()
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}