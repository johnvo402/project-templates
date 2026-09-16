using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateApp.Domain.Products;

namespace TemplateApp.Infrastructure.Persistence.Configurations;

public sealed class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("ProductImages");
        builder.HasKey(image => image.Id);
        builder.Property(image => image.Id).ValueGeneratedNever();
        builder.Property(image => image.ProductId)
            .HasConversion(id => id.Value, value => new ProductId(value))
            .IsRequired();
        builder.Property(image => image.ObjectName).HasMaxLength(512).IsRequired();
        builder.Property(image => image.IsPrimary).IsRequired();
        builder.Property(image => image.CreatedAt).IsRequired();
        builder.HasIndex(image => image.ProductId);
        builder.HasIndex(image => image.ObjectName).IsUnique();
        builder.HasOne<Product>()
            .WithMany()
            .HasForeignKey(image => image.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
