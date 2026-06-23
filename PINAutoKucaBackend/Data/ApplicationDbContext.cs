using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PINAutokucaAPI.Entities;

namespace PINAutokucaAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) 
        {
        }

        public DbSet<Car> Cars { get; set; }
        public DbSet<GalerijaFotografija> GalerijaFotografija { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<User> AKUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>()
            .HasIndex(c => c.OIB)
            .IsUnique();

            builder.Entity<Car>()
                .Property(c => c.Cijena)
                .HasColumnType("decimal(18,2)");

            builder.Entity<GalerijaFotografija>().ToTable("Images");
        }

    }
}
