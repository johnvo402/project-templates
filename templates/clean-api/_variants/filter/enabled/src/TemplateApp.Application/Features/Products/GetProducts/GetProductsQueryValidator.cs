using FluentValidation;

namespace TemplateApp.Application.Features.Products.GetProducts;

public sealed class GetProductsQueryValidator : AbstractValidator<GetProductsQuery>
{
    public GetProductsQueryValidator()
    {
        RuleFor(query => query.Query.NormalizedPage).GreaterThan(0);
        RuleFor(query => query.Query.NormalizedPageSize).InclusiveBetween(1, 100);
    }
}
