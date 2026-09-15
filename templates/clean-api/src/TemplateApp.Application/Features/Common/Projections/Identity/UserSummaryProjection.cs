using System.Linq.Expressions;
using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Common.Projections.Identity;

public sealed record UserSummaryProjection(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    bool IsActive,
    DateTimeOffset CreatedAtUtc)
{
    public static Expression<Func<AppUser, UserSummaryProjection>> MappingExpression => user => new UserSummaryProjection(
        user.Id.Value,
        user.Email,
        user.DisplayName,
        user.Role,
        user.IsActive,
        user.CreatedAtUtc);
}
