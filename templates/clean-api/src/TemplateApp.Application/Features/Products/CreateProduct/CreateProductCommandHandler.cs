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

namespace TemplateApp.Application.Features.Products.CreateProduct;

public sealed class CreateProductCommandHandler(
    IUnitOfWork unitOfWork
//#if (minio)
    , IObjectStorage storage
//#endif
)
    : ICommandHandler<CreateProductCommand, Result<Guid>>
{
    public async ValueTask<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var repository = unitOfWork.Repository<Product>();
        var existing = await repository.FirstOrDefaultAsync(
            new ProductBySkuSpecification(request.Model.Sku, asNoTracking: true),
            cancellationToken);

        if (existing is not null)
            return Result<Guid>.Failure(new Error("products.sku-conflict", "A product with this SKU already exists.", ErrorType.Conflict));

        string? uploadedObjectName = null;
        try
        {
            var product = Product.Create(
                request.Model.Name,
                request.Model.Sku,
                request.Model.Price,
                request.Model.StockQuantity);

            if (!request.Model.IsActive)
                product.Update(product.Name, product.Sku, product.Price, product.StockQuantity, false);

//#if (minio)
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

            await repository.AddAsync(product, cancellationToken);
            await unitOfWork.SaveAsync(cancellationToken);
#if REDIS
            await ProductCache.InvalidateAsync(unitOfWork, cancellationToken);
#endif
            return Result<Guid>.Success(product.Id.Value);
        }
        catch (DomainException exception)
        {
//#if (minio)
            await DeleteUploadedObjectQuietlyAsync(uploadedObjectName, cancellationToken);
//#endif
            return Result<Guid>.Failure(new Error(exception.Code, exception.Message, ErrorType.Validation));
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
