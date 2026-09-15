using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Orders.Events;

public sealed record OrderCancelledDomainEvent(OrderId OrderId) : IDomainEvent
{
    public DateTimeOffset OccurredOnUtc { get; } = DateTimeOffset.UtcNow;
}
