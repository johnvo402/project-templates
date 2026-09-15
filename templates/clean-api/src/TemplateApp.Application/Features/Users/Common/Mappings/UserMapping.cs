using TemplateApp.Application.Features.Users.Common.Projections;
using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Users.Common.Mappings;

public static class UserMapping
{
    public static UserProjection ToUser(this AppUser user)
    {
        var projection = new UserProjection();
        projection.MappingFrom(user);
        return projection;
    }

    public static IReadOnlyList<UserProjection> ToUserList(this IEnumerable<AppUser> users)
        => users.Select(user => user.ToUser()).ToList();
}
