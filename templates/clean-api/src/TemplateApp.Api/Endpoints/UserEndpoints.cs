using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.Users.ChangeUserRole;
using TemplateApp.Application.Features.Users.Common.Models;
using TemplateApp.Application.Features.Users.ListUsers;

namespace TemplateApp.Api.Endpoints;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/users").WithTags("Users");

        group.MapGet("/", async (ISender sender, CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new ListUsersQuery(), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("ListUsers")
        .RequireAuthorization(AppPolicies.UsersRead);

        group.MapPut("/{id:guid}/role", async (
            Guid id,
            ChangeUserRoleModel model,
            ISender sender,
            CancellationToken cancellationToken) =>
        {
            var result = await sender.Send(new ChangeUserRoleCommand(id, model), cancellationToken);
            return result.ToHttpResult();
        })
        .WithName("ChangeUserRole")
        .RequireAuthorization(AppPolicies.UsersManage);

        return endpoints;
    }
}
