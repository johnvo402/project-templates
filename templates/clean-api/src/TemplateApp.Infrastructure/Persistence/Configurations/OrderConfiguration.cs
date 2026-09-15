using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateApp.Domain.Orders;
using TemplateApp.Domain.Products;

namespace TemplateApp.Infrastructure.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasConversion(id => id.Value, value => new OrderId(value)).ValueGeneratedNever();
        builder.Property(x => x.OrderNumber).HasMaxLength(64).IsRequired();
        builder.HasIndex(x => x.OrderNumber).IsUnique();
        builder.Property(x => x.CustomerName).HasMaxLength(160).IsRequired();
        builder.Property(x => x.CustomerPhone).HasMaxLength(32);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(32).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt).IsRequired();
        builder.Ignore(x => x.TotalAmount);

        builder.OwnsMany(x => x.Items, items =>
        {
            items.ToTable("OrderItems");
            items.WithOwner().HasForeignKey("OrderId");
            items.Property<int>("Id");
            items.HasKey("Id");
            items.Property(x => x.ProductId).HasConversion(id => id.Value, value => new ProductId(value)).IsRequired();
            items.Property(x => x.ProductName).HasMaxLength(200).IsRequired();
            items.Property(x => x.UnitPrice).HasPrecision(18, 2);
            items.Ignore(x => x.Total);
        });
    }
}
