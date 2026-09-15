using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Profile.GetProfile;

public sealed record GetProfileQuery(Guid UserId) : IQuery<Result<GetProfileResponse>>;
