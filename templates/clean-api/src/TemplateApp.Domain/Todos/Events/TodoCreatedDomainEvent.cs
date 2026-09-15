using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Todos.Events;

public sealed record TodoCreatedDomainEvent(TodoId TodoId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}
