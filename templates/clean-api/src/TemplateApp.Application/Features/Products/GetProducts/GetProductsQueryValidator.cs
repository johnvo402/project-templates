using FluentValidation;

namespace TemplateApp.Application.Features.Products.GetProducts;

public sealed class GetProductsQueryValidator : AbstractValidator<GetProductsQuery>
{
    public GetProductsQueryValidator()
    {
        RuleFor(x => x.Page.Page).GreaterThan(0);
        RuleFor(x => x.Page.PageSize).InclusiveBetween(1, 100);
    }
}
