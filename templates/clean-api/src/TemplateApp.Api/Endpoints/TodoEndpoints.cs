using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.Todos.Common.Models;
using TemplateApp.Application.Features.Todos.CompleteTodo;
using TemplateApp.Application.Features.Todos.CreateTodo;
using TemplateApp.Application.Features.Todos.GetTodos;

namespace TemplateApp.Api.Endpoints;

public static class TodoEndpoints
{
    public static IEndpointRouteBuilder MapTodoEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/todos").WithTags("Todos");

        group.MapGet("/", async (
            int? page,
            int? pageSize,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new GetTodosQuery(page ?? 1, pageSize ?? 20), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("ListTodos")
        .RequireAuthorization(AppPolicies.TodosRead);

        group.MapPost("/", async (TodoModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new CreateTodoCommand(model), cancellationToken);
            return result.ToCreatedHttpResult(result.IsSuccess ? $"/api/todos/{result.Value}" : "/api/todos");
        })
        .WithName("CreateTodo")
        .RequireAuthorization(AppPolicies.TodosWrite);

        group.MapPost("/{id:guid}/complete", async (Guid id, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new CompleteTodoCommand(id), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("CompleteTodo")
        .RequireAuthorization(AppPolicies.TodosWrite);

        return endpoints;
    }
}
