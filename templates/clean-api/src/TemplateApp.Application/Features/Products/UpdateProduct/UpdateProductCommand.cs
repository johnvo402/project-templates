using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common.Models;

namespace TemplateApp.Application.Features.Products.UpdateProduct;

public sealed record UpdateProductCommand(
    Guid Id,
    ProductModel Model
//#if (minio)
    , ProductImageModel? Image = null
//#endif
) : ICommand<Result>;
