using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateApp.Domain.Todos;

namespace TemplateApp.Infrastructure.Persistence.Configurations;

public sealed class TodoItemConfiguration : IEntityTypeConfiguration<TodoItem>
{
    public void Configure(EntityTypeBuilder<TodoItem> builder)
    {
        builder.ToTable("Todos");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasConversion(id => id.Value, value => new TodoId(value))
            .ValueGeneratedNever();

        builder.OwnsOne(x => x.Title, title =>
        {
            title.Property(x => x.Value)
                .HasColumnName("Title")
                .HasMaxLength(TodoTitle.MaxLength)
                .IsRequired();
        });
        builder.Navigation(x => x.Title).IsRequired();

        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.CompletedAtUtc);

        builder.Ignore(x => x.DomainEvents);
    }
}
