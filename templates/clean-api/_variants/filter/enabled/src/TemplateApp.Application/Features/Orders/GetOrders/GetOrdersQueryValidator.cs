using FluentValidation;

namespace TemplateApp.Application.Features.Orders.GetOrders;

public sealed class GetOrdersQueryValidator : AbstractValidator<GetOrdersQuery>
{
    public GetOrdersQueryValidator()
    {
        RuleFor(query => query.Query.NormalizedPage).GreaterThan(0);
        RuleFor(query => query.Query.NormalizedPageSize).InclusiveBetween(1, 100);
    }
}
