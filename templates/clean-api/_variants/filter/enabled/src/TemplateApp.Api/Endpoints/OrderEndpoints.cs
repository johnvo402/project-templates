using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Querying;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.Orders.CancelOrder;
using TemplateApp.Application.Features.Orders.Common.Models;
using TemplateApp.Application.Features.Orders.Common.Projections;
using TemplateApp.Application.Features.Orders.CreateOrder;
using TemplateApp.Application.Features.Orders.GetOrder;
using TemplateApp.Application.Features.Orders.GetOrders;
using TemplateApp.Application.Features.Orders.UpdateOrderStatus;

namespace TemplateApp.Api.Endpoints;

public static class OrderEndpoints
{
    public static IEndpointRouteBuilder MapOrderEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/orders").WithTags("Orders");

        group.MapGet("/", async (HttpRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var parsed = LhsBracketQueryParser.Parse<OrderSummaryProjection>(request.Query);
            if (parsed.IsFailure) return parsed.ToHttpResult();

            var result = await sender.Send(new GetOrdersQuery(parsed.Value!), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("ListOrders")
        .RequireAuthorization(AppPolicies.OrdersView);

        group.MapGet("/{id:guid}", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetOrderQuery(id), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("GetOrder")
        .RequireAuthorization(AppPolicies.OrdersView);

        group.MapPost("/", async (CreateOrderModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new CreateOrderCommand(model), cancellationToken);
            return result.ToCreatedHttpResult(result.IsSuccess ? $"/api/orders/{result.Value}" : "/api/orders");
        })
        .WithName("CreateOrder")
        .RequireAuthorization(AppPolicies.OrdersCreate);

        group.MapPut("/{id:guid}/status", async (Guid id, UpdateOrderStatusModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new UpdateOrderStatusCommand(id, model.Status), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("UpdateOrderStatus")
        .RequireAuthorization(AppPolicies.OrdersUpdateStatus);

        group.MapPost("/{id:guid}/cancel", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new CancelOrderCommand(id), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("CancelOrder")
        .RequireAuthorization(AppPolicies.OrdersCancel);

        return endpoints;
    }
}
