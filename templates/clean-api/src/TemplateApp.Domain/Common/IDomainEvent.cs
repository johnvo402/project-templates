using Mediator;

namespace TemplateApp.Domain.Common;

public interface IDomainEvent : INotification
{
    DateTimeOffset OccurredOnUtc { get; }
}
