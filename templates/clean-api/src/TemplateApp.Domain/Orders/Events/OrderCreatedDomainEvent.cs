using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Orders.Events;

public sealed record OrderCreatedDomainEvent(OrderId OrderId) : IDomainEvent;
