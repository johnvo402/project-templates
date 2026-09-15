using FluentValidation;
using TemplateApp.Domain.Orders;

namespace TemplateApp.Application.Features.Orders.UpdateOrderStatus;

public sealed class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).IsInEnum().NotEqual(OrderStatus.Cancelled)
            .WithMessage("Use the cancel order endpoint to cancel an order.");
    }
}
