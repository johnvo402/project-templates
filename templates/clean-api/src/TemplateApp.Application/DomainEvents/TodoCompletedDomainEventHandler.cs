using Mediator;
using TemplateApp.Domain.Todos.Events;

namespace TemplateApp.Application.DomainEvents;

public sealed class TodoCompletedDomainEventHandler
    : INotificationHandler<TodoCompletedDomainEvent>
{
    public ValueTask Handle(
        TodoCompletedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        // Add in-process side effects here. Use an outbox for integration events.
        return ValueTask.CompletedTask;
    }
}
