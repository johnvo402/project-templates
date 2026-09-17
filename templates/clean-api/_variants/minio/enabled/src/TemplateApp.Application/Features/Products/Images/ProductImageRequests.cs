using FluentValidation;
using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Images.Common.Models;
using TemplateApp.Application.Features.Products.Images.Common.Projections;

namespace TemplateApp.Application.Features.Products.Images;

public sealed record GetProductImagesQuery(Guid ProductId)
    : IQuery<Result<IReadOnlyList<ProductImageProjection>>>;

public sealed record UploadProductImageCommand(Guid ProductId, ProductImageUploadModel Model)
    : ICommand<Result<ProductImageProjection>>;

public sealed record DeleteProductImageCommand(Guid ProductId, Guid ImageId)
    : ICommand<Result>;

public sealed record SetPrimaryProductImageCommand(Guid ProductId, Guid ImageId)
    : ICommand<Result>;

public sealed class UploadProductImageCommandValidator : AbstractValidator<UploadProductImageCommand>
{
    public UploadProductImageCommandValidator(IValidator<ProductImageUploadModel> modelValidator)
    {
        RuleFor(command => command.ProductId).NotEmpty();
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
