using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateApp.Domain.Settings;

namespace TemplateApp.Infrastructure.Persistence.Configurations;

public sealed class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
    public void Configure(EntityTypeBuilder<StoreSettings> builder)
    {
        builder.ToTable("StoreSettings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasConversion(id => id.Value, value => new StoreSettingsId(value)).ValueGeneratedNever();
        builder.Property(x => x.StoreName).HasMaxLength(160).IsRequired();
        builder.Property(x => x.StoreEmail).HasMaxLength(320);
        builder.Property(x => x.StorePhone).HasMaxLength(32);
        builder.Property(x => x.Currency).HasMaxLength(8).IsRequired();
        builder.Property(x => x.Timezone).HasMaxLength(80).IsRequired();
    }
}
