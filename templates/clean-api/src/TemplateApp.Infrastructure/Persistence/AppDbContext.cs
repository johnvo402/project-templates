using Microsoft.EntityFrameworkCore;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Orders;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Settings;

namespace TemplateApp.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<RefreshSession> RefreshSessions => Set<RefreshSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
