using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Orders.Events;

public sealed record OrderCancelledDomainEvent(OrderId OrderId) : IDomainEvent;
