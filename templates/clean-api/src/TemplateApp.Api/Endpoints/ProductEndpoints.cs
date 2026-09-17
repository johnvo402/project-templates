using Mediator;
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

        group.MapDelete("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new DeleteProductCommand(id), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("DeleteProduct")
        .RequireAuthorization(AppPolicies.ProductsDelete);

        return endpoints;
    }
}
