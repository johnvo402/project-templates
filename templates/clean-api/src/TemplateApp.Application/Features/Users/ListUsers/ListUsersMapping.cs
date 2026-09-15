using System.Linq.Expressions;
using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Users.ListUsers;

public static class ListUsersMapping
{
    public static Expression<Func<AppUser, ListUsersResponse>> Selector() =>
        user => new ListUsersResponse
        {
            Id = user.Id.Value,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAtUtc = user.CreatedAtUtc
        };
}
