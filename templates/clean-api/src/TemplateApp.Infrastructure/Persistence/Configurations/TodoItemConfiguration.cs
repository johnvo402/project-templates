using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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

        var titleConverter = new ValueConverter<TodoTitle, string>(
            title => title.Value,
            value => TodoTitle.Create(value));

        builder.Property(x => x.Title)
            .HasConversion(titleConverter)
            .HasMaxLength(TodoTitle.MaxLength)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.CompletedAtUtc);

        builder.Ignore(x => x.DomainEvents);
    }
}
