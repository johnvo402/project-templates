using FluentValidation;
using TemplateApp.Application.Features.Orders.Common.Models;

namespace TemplateApp.Application.Features.Orders.Common.Validators;

public sealed class CreateOrderModelValidator : AbstractValidator<CreateOrderModel>
{
    public CreateOrderModelValidator()
    {
        RuleFor(x => x.CustomerName).NotEmpty().MaximumLength(160);
        RuleFor(x => x.CustomerPhone).MaximumLength(32);
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(x => x.ProductId).NotEmpty();
            item.RuleFor(x => x.Quantity).GreaterThan(0);
        });
        RuleFor(x => x.Items)
            .Must(items => items.Select(x => x.ProductId).Distinct().Count() == items.Count)
            .WithMessage("An order cannot contain the same product more than once.");
    }
}
