using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Common.Projections.Identity;

namespace TemplateApp.Application.Features.Profile.GetProfile;

public sealed record GetProfileQuery(Guid UserId) : IQuery<Result<UserProfileProjection>>;
