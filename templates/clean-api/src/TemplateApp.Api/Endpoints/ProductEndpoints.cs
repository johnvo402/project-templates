using Mediator;
//#if (minio)
using Microsoft.AspNetCore.Mvc;
//#endif
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Features.Products.Common.Models;
using TemplateApp.Application.Features.Products.CreateProduct;
using TemplateApp.Application.Features.Products.DeleteProduct;
using TemplateApp.Application.Features.Products.GetProduct;
using TemplateApp.Application.Features.Products.GetProducts;
using TemplateApp.Application.Features.Products.UpdateProduct;

namespace TemplateApp.Api.Endpoints;

public static class ProductEndpoints
{
    private const long MaxProductImageBytes = 5 * 1024 * 1024;

    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", async (int? page, int? pageSize, bool? isActive, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(
                new GetProductsQuery(new PageParameters(page ?? 1, pageSize ?? 20), isActive),
                cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("ListProducts")
        .RequireAuthorization(AppPolicies.ProductsView);

        group.MapGet("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetProductQuery(id), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("GetProduct")
        .RequireAuthorization(AppPolicies.ProductsView);

//#if (minio)
        group.MapPost("/", async ([FromForm] ProductFormRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var image = await ToImageModelAsync(request.Image, cancellationToken);
            if (image.IsFailure) return image.ToHttpResult();
            var result = await sender.Send(new CreateProductCommand(request.ToModel(), image.Value), cancellationToken);
            return result.ToCreatedHttpResult(result.IsSuccess ? $"/api/products/{result.Value}" : "/api/products");
        })
        .WithName("CreateProduct")
        .DisableAntiforgery()
        .RequireAuthorization(AppPolicies.ProductsCreate);

        group.MapPut("/{id:guid}", async (Guid id, [FromForm] ProductFormRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var image = await ToImageModelAsync(request.Image, cancellationToken);
            if (image.IsFailure) return image.ToHttpResult();
            var result = await sender.Send(new UpdateProductCommand(id, request.ToModel(), image.Value), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("UpdateProduct")
        .DisableAntiforgery()
        .RequireAuthorization(AppPolicies.ProductsUpdate);
//#else
        group.MapPost("/", async (ProductModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new CreateProductCommand(model), cancellationToken);
            return result.ToCreatedHttpResult(result.IsSuccess ? $"/api/products/{result.Value}" : "/api/products");
        })
        .WithName("CreateProduct")
        .RequireAuthorization(AppPolicies.ProductsCreate);

        group.MapPut("/{id:guid}", async (Guid id, ProductModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new UpdateProductCommand(id, model), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("UpdateProduct")
        .RequireAuthorization(AppPolicies.ProductsUpdate);
//#endif

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new DeleteProductCommand(id), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("DeleteProduct")
        .RequireAuthorization(AppPolicies.ProductsDelete);

        return endpoints;
    }

//#if (minio)
    private static async Task<Result<ProductImageModel?>> ToImageModelAsync(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null) return Result<ProductImageModel?>.Success(null);
        if (file.Length <= 0 || file.Length > MaxProductImageBytes)
            return Result<ProductImageModel?>.Failure(new Error("products.image.size", "Product image must be between 1 byte and 5 MB.", ErrorType.Validation));

        await using var source = file.OpenReadStream();
        using var buffer = new MemoryStream((int)file.Length);
        await source.CopyToAsync(buffer, cancellationToken);
        return Result<ProductImageModel?>.Success(new ProductImageModel(file.FileName, file.ContentType, buffer.ToArray()));
    }

    private sealed class ProductFormRequest
    {
        public string Name { get; init; } = string.Empty;
        public string Sku { get; init; } = string.Empty;
        public decimal Price { get; init; }
        public int StockQuantity { get; init; }
        public bool IsActive { get; init; } = true;
        public IFormFile? Image { get; init; }

        public ProductModel ToModel() => new(Name, Sku, Price, StockQuantity, IsActive);
    }
//#endif
}
