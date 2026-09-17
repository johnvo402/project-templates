using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
//#if (minio)
using TemplateApp.Application.Abstractions.Storage;
//#endif
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Common;
using TemplateApp.Domain.Common;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Products.UpdateProduct;

public sealed class UpdateProductCommandHandler(
    IUnitOfWork unitOfWork
//#if (minio)
    , IObjectStorage storage
//#endif
)
    : ICommandHandler<UpdateProductCommand, Result>
{
    public async ValueTask<Result> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<Product>();
        var product = await repository.FirstOrDefaultAsync(
            new ProductByIdSpecification(new ProductId(request.Id)),
            cancellationToken);

        if (product is null)
            return Result.Failure(new Error("products.not-found", "Product was not found.", ErrorType.NotFound));

        var skuOwner = await repository.FirstOrDefaultAsync(
            new ProductBySkuSpecification(request.Model.Sku, asNoTracking: true),
            cancellationToken);

        if (skuOwner is not null && skuOwner.Id != product.Id)
            return Result.Failure(new Error("products.sku-conflict", "A product with this SKU already exists.", ErrorType.Conflict));

//#if (minio)
        var previousObjectName = product.ImageObjectName;
        string? uploadedObjectName = null;
//#endif

        try
        {
            product.Update(
                request.Model.Name,
                request.Model.Sku,
                request.Model.Price,
                request.Model.StockQuantity,
                request.Model.IsActive);

//#if (minio)
            // No image in the request means preserve the current image and do not touch object storage.
            if (request.Image is not null)
            {
                uploadedObjectName = BuildObjectName(product.Id.Value, request.Image.ContentType);
                await using var stream = new MemoryStream(request.Image.Content, writable: false);
                await storage.UploadAsync(
                    uploadedObjectName,
                    stream,
                    request.Image.Content.LongLength,
                    request.Image.ContentType,
                    cancellationToken);
                product.SetImage(uploadedObjectName);
            }
//#endif

            await unitOfWork.SaveAsync(cancellationToken);
#if REDIS
            await ProductCache.InvalidateAsync(unitOfWork, cancellationToken);
#endif

//#if (minio)
            if (uploadedObjectName is not null
                && !string.IsNullOrWhiteSpace(previousObjectName)
                && !string.Equals(previousObjectName, uploadedObjectName, StringComparison.Ordinal))
            {
                try { await storage.DeleteAsync(previousObjectName, cancellationToken); }
                catch { }
            }
//#endif
            return Result.Success();
        }
        catch (DomainException exception)
        {
//#if (minio)
            await DeleteUploadedObjectQuietlyAsync(uploadedObjectName, cancellationToken);
//#endif
            return Result.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
        }
        catch
        {
//#if (minio)
            await DeleteUploadedObjectQuietlyAsync(uploadedObjectName, cancellationToken);
//#endif
            throw;
        }
    }

//#if (minio)
    private static string BuildObjectName(Guid productId, string contentType)
    {
        var extension = contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".bin"
        };
        return $"products/{productId:N}/{Guid.NewGuid():N}{extension}";
    }

    private async Task DeleteUploadedObjectQuietlyAsync(string? objectName, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(objectName)) return;
        try { await storage.DeleteAsync(objectName, cancellationToken); }
        catch { }
    }
//#endif
}
