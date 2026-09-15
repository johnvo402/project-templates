using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed record GetAvatarQuery(Guid UserId) : IQuery<Result<AvatarProjection>>;
