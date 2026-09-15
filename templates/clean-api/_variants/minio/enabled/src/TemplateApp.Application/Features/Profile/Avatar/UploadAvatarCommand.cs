using Mediator;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed record UploadAvatarCommand(Guid UserId, AvatarUploadModel Model)
    : ICommand<Result<AvatarProjection>>;
