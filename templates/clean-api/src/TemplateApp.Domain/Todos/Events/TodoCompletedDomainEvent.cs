using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Todos.Events;

public sealed record TodoCompletedDomainEvent(TodoId TodoId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}
