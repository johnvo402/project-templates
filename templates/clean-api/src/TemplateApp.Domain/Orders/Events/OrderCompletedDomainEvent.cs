using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Orders.Events;

public sealed record OrderCompletedDomainEvent(OrderId OrderId) : IDomainEvent;
