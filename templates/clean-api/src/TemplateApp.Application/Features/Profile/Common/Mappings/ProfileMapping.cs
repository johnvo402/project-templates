using TemplateApp.Application.Features.Profile.Common.Projections;
using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Profile.Common.Mappings;

public static class ProfileMapping
{
    public static ProfileProjection ToProfile(this AppUser user)
    {
        var projection = new ProfileProjection();
        projection.MappingFrom(user);
        return projection;
    }
}
