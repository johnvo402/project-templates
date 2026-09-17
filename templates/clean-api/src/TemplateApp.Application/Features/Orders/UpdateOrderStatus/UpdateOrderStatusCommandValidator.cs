using FluentValidation;
using TemplateApp.Domain.Orders;

namespace TemplateApp.Application.Features.Orders.UpdateOrderStatus;

public sealed class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(static status =>
                Enum.TryParse<OrderStatus>(status, ignoreCase: true, out var parsed) &&
                parsed is OrderStatus.Processing or OrderStatus.Completed)
            .WithMessage("Status must be Processing or Completed. Use the cancel order endpoint to cancel an order.");
    }
}
