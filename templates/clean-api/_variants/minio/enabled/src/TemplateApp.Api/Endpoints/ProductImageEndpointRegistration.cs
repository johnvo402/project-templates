using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.Products.Images;
using TemplateApp.Application.Features.Products.Images.Common.Models;

namespace TemplateApp.Api.Endpoints;

public static class ProductImageEndpointRegistration
{
    private const long MaxImageBytes = 5 * 1024 * 1024;

    public static IEndpointRouteBuilder MapOptionalProductImageEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/{id:guid}/images", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetProductImagesQuery(id), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("ListProductImages")
        .RequireAuthorization(AppPolicies.ProductsView);

        group.MapPost("/{id:guid}/images", async (
            Guid id,
            IFormFile file,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            if (file.Length <= 0 || file.Length > MaxImageBytes)
                return Results.BadRequest(new { message = "Product image must be between 1 byte and 5 MB." });

            await using var source = file.OpenReadStream();
            using var buffer = new MemoryStream((int)file.Length);
            await source.CopyToAsync(buffer, cancellationToken);

            var model = new ProductImageUploadModel(file.FileName, file.ContentType, buffer.ToArray());
            var result = await sender.Send(new UploadProductImageCommand(id, model), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("UploadProductImage")
        .Accepts<IFormFile>("multipart/form-data")
        .DisableAntiforgery()
        .RequireAuthorization(AppPolicies.ProductsUpdate);

        group.MapDelete("/{id:guid}/images/{imageId:guid}", async (
            Guid id,
            Guid imageId,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new DeleteProductImageCommand(id, imageId), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("DeleteProductImage")
        .RequireAuthorization(AppPolicies.ProductsUpdate);

        group.MapPut("/{id:guid}/images/{imageId:guid}/primary", async (
            Guid id,
            Guid imageId,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new SetPrimaryProductImageCommand(id, imageId), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("SetPrimaryProductImage")
        .RequireAuthorization(AppPolicies.ProductsUpdate);

        return endpoints;
    }
}
