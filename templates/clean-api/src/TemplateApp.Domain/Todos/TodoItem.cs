using TemplateApp.Domain.Common;
using TemplateApp.Domain.Todos.Events;

namespace TemplateApp.Domain.Todos;

public sealed class TodoItem : AggregateRoot<TodoId>
{
    private TodoItem() { }

    private TodoItem(TodoId id, TodoTitle title) : base(id)
    {
        Title = title;
        CreatedAtUtc = DateTimeOffset.UtcNow;
        RaiseDomainEvent(new TodoCreatedDomainEvent(id));
    }

    public TodoTitle Title { get; private set; } = null!;
    public bool IsCompleted { get; private set; }
    public DateTimeOffset CreatedAtUtc { get; private set; }
    public DateTimeOffset? CompletedAtUtc { get; private set; }

    public static TodoItem Create(string title) => new(TodoId.New(), TodoTitle.Create(title));

    public void Rename(string title)
    {
        var newTitle = TodoTitle.Create(title);
        if (Title == newTitle) return;
        Title = newTitle;
    }

    public void Complete()
    {
        if (IsCompleted) return;

        IsCompleted = true;
        CompletedAtUtc = DateTimeOffset.UtcNow;
        RaiseDomainEvent(new TodoCompletedDomainEvent(Id));
    }
}
