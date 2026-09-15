using FluentValidation;

namespace TemplateApp.Application.Features.Reports.GetTopProducts;

public sealed class GetTopProductsQueryValidator : AbstractValidator<GetTopProductsQuery>
{
    public GetTopProductsQueryValidator() => RuleFor(x => x.Take).InclusiveBetween(1, 50);
}
