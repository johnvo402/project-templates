using System.Linq.Expressions;
using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Common.Projections.Identity;

public sealed record UserProfileProjection(
    Guid Id,
    string Email,
    string DisplayName,
    string? Bio,
    string Role,
    IReadOnlyCollection<string>? Permissions = null)
{
    public static Expression<Func<AppUser, UserProfileProjection>> MappingExpression => user => new UserProfileProjection(
        user.Id.Value,
        user.Email,
        user.DisplayName,
        user.Bio,
        user.Role,
        null);
}
