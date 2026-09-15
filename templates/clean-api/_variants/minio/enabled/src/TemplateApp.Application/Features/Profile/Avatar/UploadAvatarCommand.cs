using Mediator;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Profile.Common.Models;
using TemplateApp.Application.Features.Profile.Common.Projections;

namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed record UploadAvatarCommand(Guid UserId, AvatarUploadModel Model)
    : ICommand<Result<AvatarProjection>>;
