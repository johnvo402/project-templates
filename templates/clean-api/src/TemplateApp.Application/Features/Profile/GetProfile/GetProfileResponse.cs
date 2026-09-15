using TemplateApp.Application.Features.Profile.Common.Projections;

namespace TemplateApp.Application.Features.Profile.GetProfile;

public sealed class GetProfileResponse : ProfileProjection
{
    public IReadOnlyCollection<string> Permissions { get; set; } = [];
}
