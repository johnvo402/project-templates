using FluentValidation;

namespace TemplateApp.Application.Features.Orders.GetOrders;

public sealed class GetOrdersQueryValidator : AbstractValidator<GetOrdersQuery>
{
    public GetOrdersQueryValidator()
    {
        RuleFor(x => x.Page.Page).GreaterThan(0);
        RuleFor(x => x.Page.PageSize).InclusiveBetween(1, 100);
    }
}
