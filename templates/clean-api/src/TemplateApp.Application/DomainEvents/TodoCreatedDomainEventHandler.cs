using Mediator;
using TemplateApp.Domain.Todos.Events;

namespace TemplateApp.Application.DomainEvents;

public sealed class TodoCreatedDomainEventHandler
    : INotificationHandler<TodoCreatedDomainEvent>
{
    public ValueTask Handle(
        TodoCreatedDomainEvent notification,
        CancellationToken cancellationToken)
    {
        // Add in-process side effects here. Use an outbox for integration events.
        return ValueTask.CompletedTask;
    }
}
