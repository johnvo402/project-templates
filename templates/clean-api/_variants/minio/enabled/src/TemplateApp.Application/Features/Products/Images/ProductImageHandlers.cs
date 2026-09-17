using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Abstractions.Storage;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Products.Images.Common.Projections;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;

namespace TemplateApp.Application.Features.Products.Images;

public sealed class GetProductImagesQueryHandler(IUnitOfWork unitOfWork, IObjectStorage storage)
    : IQueryHandler<GetProductImagesQuery, Result<IReadOnlyList<ProductImageProjection>>>
{
    public async ValueTask<Result<IReadOnlyList<ProductImageProjection>>> Handle(
        GetProductImagesQuery request,
        CancellationToken cancellationToken)
    {
        var productId = new ProductId(request.ProductId);
        var exists = await unitOfWork.ReadOnlyRepository<Product>().AnyAsync(
            new ProductByIdSpecification(productId, true), cancellationToken);
        if (!exists)
            return Result<IReadOnlyList<ProductImageProjection>>.Failure(
                new Error("products.not-found", "Product was not found.", ErrorType.NotFound));

        var images = await unitOfWork.ReadOnlyRepository<ProductImage>().ListAsync(
            new ProductImagesByProductIdSpecification(productId, true), cancellationToken);
        var result = new List<ProductImageProjection>(images.Count);
        foreach (var image in images)
        {
            var url = await storage.GetPresignedDownloadUrlAsync(image.ObjectName, cancellationToken: cancellationToken);
            result.Add(new ProductImageProjection(image.Id, url, image.IsPrimary, image.CreatedAt));
        }

        return Result<IReadOnlyList<ProductImageProjection>>.Success(result);
    }
}

public sealed class UploadProductImageCommandHandler(IUnitOfWork unitOfWork, IObjectStorage storage)
    : ICommandHandler<UploadProductImageCommand, Result<ProductImageProjection>>
{
    private const int MaxImagesPerProduct = 8;

    public async ValueTask<Result<ProductImageProjection>> Handle(
        UploadProductImageCommand command,
        CancellationToken cancellationToken)
    {
        var productId = new ProductId(command.ProductId);
        var exists = await unitOfWork.ReadOnlyRepository<Product>().AnyAsync(
            new ProductByIdSpecification(productId, true), cancellationToken);
        if (!exists)
            return Result<ProductImageProjection>.Failure(
                new Error("products.not-found", "Product was not found.", ErrorType.NotFound));

        var imageRepository = unitOfWork.Repository<ProductImage>();
        var existing = await imageRepository.ListAsync(
            new ProductImagesByProductIdSpecification(productId, true), cancellationToken);
        if (existing.Count >= MaxImagesPerProduct)
            return Result<ProductImageProjection>.Failure(
                new Error("products.images.limit", $"A product can have at most {MaxImagesPerProduct} images.", ErrorType.Conflict));

        var extension = command.Model.ContentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".bin"
        };
        var objectName = $"products/{command.ProductId:N}/{Guid.NewGuid():N}{extension}";
        var image = ProductImage.Create(productId, objectName, existing.Count == 0);

        await using var stream = new MemoryStream(command.Model.Content, writable: false);
        await storage.UploadAsync(
            objectName,
            stream,
            command.Model.Content.LongLength,
            command.Model.ContentType,
            cancellationToken);

        try
        {
            await imageRepository.AddAsync(image, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            try { await storage.DeleteAsync(objectName, cancellationToken); }
            catch { }
            throw;
        }

        var url = await storage.GetPresignedDownloadUrlAsync(objectName, cancellationToken: cancellationToken);
        return Result<ProductImageProjection>.Success(
            new ProductImageProjection(image.Id, url, image.IsPrimary, image.CreatedAt));
    }
}

public sealed class DeleteProductImageCommandHandler(IUnitOfWork unitOfWork, IObjectStorage storage)
    : ICommandHandler<DeleteProductImageCommand, Result>
{
    public async ValueTask<Result> Handle(DeleteProductImageCommand command, CancellationToken cancellationToken)
    {
        var productId = new ProductId(command.ProductId);
        var repository = unitOfWork.Repository<ProductImage>();
        var images = await repository.ListAsync(
            new ProductImagesByProductIdSpecification(productId), cancellationToken);
        var target = images.FirstOrDefault(image => image.Id == command.ImageId);
        if (target is null)
            return Result.Failure(new Error("products.images.not-found", "Product image was not found.", ErrorType.NotFound));

        if (target.IsPrimary)
        {
            var replacement = images
                .Where(image => image.Id != target.Id)
                .OrderBy(image => image.CreatedAt)
                .FirstOrDefault();
            replacement?.SetPrimary(true);
        }

        repository.Remove(target);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        try { await storage.DeleteAsync(target.ObjectName, cancellationToken); }
        catch { }

        return Result.Success();
    }
}

public sealed class SetPrimaryProductImageCommandHandler(IUnitOfWork unitOfWork)
    : ICommandHandler<SetPrimaryProductImageCommand, Result>
{
    public async ValueTask<Result> Handle(SetPrimaryProductImageCommand command, CancellationToken cancellationToken)
    {
        var productId = new ProductId(command.ProductId);
        var repository = unitOfWork.Repository<ProductImage>();
        var images = await repository.ListAsync(
            new ProductImagesByProductIdSpecification(productId), cancellationToken);
        var target = images.FirstOrDefault(image => image.Id == command.ImageId);
        if (target is null)
            return Result.Failure(new Error("products.images.not-found", "Product image was not found.", ErrorType.NotFound));

        foreach (var image in images)
            image.SetPrimary(image.Id == target.Id);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
