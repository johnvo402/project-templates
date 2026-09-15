using System.Linq.Expressions;
using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Profile.GetProfile;

public static class GetProfileMapping
{
    public static Expression<Func<AppUser, GetProfileResponse>> Selector() =>
        user => new GetProfileResponse
        {
            Id = user.Id.Value,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Bio = user.Bio,
            Role = user.Role
        };
}
