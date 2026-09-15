using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Profile.Common.Projections;

namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed record GetAvatarQuery(Guid UserId) : IQuery<Result<AvatarProjection>>;
