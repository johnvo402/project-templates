using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Querying;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.Employees.ChangeEmployeeRole;
using TemplateApp.Application.Features.Employees.Common.Models;
using TemplateApp.Application.Features.Employees.Common.Projections;
using TemplateApp.Application.Features.Employees.CreateEmployee;
using TemplateApp.Application.Features.Employees.GetEmployees;
using TemplateApp.Application.Features.Employees.SetEmployeeStatus;

namespace TemplateApp.Api.Endpoints;

public static class EmployeeEndpoints
{
    public static IEndpointRouteBuilder MapEmployeeEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/employees").WithTags("Employees");

        group.MapGet("/", async (HttpRequest request, ISender sender, CancellationToken cancellationToken) =>
        {
            var parsed = LhsBracketQueryParser.Parse<EmployeeProjection>(request.Query);
            if (parsed.IsFailure) return parsed.ToHttpResult();

            var result = await sender.Send(new GetEmployeesQuery(parsed.Value!), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("ListEmployees")
        .RequireAuthorization(AppPolicies.EmployeesView);

        group.MapPost("/", async (CreateEmployeeModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new CreateEmployeeCommand(model), cancellationToken);
            return result.ToCreatedHttpResult(result.IsSuccess ? $"/api/employees/{result.Value}" : "/api/employees");
        })
        .WithName("CreateEmployee")
        .RequireAuthorization(AppPolicies.EmployeesCreate);

        group.MapPut("/{id:guid}/role", async (Guid id, ChangeEmployeeRoleModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new ChangeEmployeeRoleCommand(id, model), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("ChangeEmployeeRole")
        .RequireAuthorization(AppPolicies.EmployeesChangeRole);

        group.MapPut("/{id:guid}/status", async (Guid id, EmployeeStatusModel model, ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new SetEmployeeStatusCommand(id, model), cancellationToken);
            return result.ToNoContentHttpResult();
        })
        .WithName("SetEmployeeStatus")
        .RequireAuthorization(AppPolicies.EmployeesUpdate);

        return endpoints;
    }
}
