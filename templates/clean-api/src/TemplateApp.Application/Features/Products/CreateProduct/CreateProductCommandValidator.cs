using FluentValidation;
using TemplateApp.Application.Features.Products.Common.Models;

namespace TemplateApp.Application.Features.Products.CreateProduct;

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator(
        IValidator<ProductModel> modelValidator
//#if (minio)
        , IValidator<ProductImageModel> imageValidator
//#endif
    )
    {
        RuleFor(x => x.Model).NotNull();
        RuleFor(x => x.Model).SetValidator(modelValidator);
//#if (minio)
        When(x => x.Image is not null, () => RuleFor(x => x.Image!).SetValidator(imageValidator));
//#endif
    }
}
