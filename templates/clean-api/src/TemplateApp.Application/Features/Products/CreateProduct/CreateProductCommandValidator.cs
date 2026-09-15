using FluentValidation;
using TemplateApp.Application.Features.Products.Common.Models;

namespace TemplateApp.Application.Features.Products.CreateProduct;

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator(IValidator<ProductModel> modelValidator)
    {
        RuleFor(x => x.Model).NotNull();
        RuleFor(x => x.Model).SetValidator(modelValidator);
    }
}
