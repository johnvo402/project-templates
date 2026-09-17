using FluentValidation;
using TemplateApp.Application.Features.Orders.Common.Models;

namespace TemplateApp.Application.Features.Orders.CreateOrder;

public sealed class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator(IValidator<CreateOrderModel> modelValidator)
    {
        RuleFor(x => x.Model).NotNull();
        RuleFor(x => x.Model).SetValidator(modelValidator);
    }
}
