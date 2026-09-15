using TemplateApp.Domain.Todos;

namespace TemplateApp.Application.Features.Todos.Common.Projections;

public class TodoProjection
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }

    public virtual void MappingFrom(TodoItem todo)
    {
        Id = todo.Id.Value;
        Title = todo.Title.Value;
        IsCompleted = todo.IsCompleted;
        CreatedAtUtc = todo.CreatedAtUtc;
        CompletedAtUtc = todo.CompletedAtUtc;
    }
}
