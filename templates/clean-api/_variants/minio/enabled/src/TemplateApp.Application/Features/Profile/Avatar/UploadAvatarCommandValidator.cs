using FluentValidation;
using TemplateApp.Application.Features.Profile.Common.Models;

namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed class UploadAvatarCommandValidator : AbstractValidator<UploadAvatarCommand>
{
    public UploadAvatarCommandValidator(IValidator<AvatarUploadModel> modelValidator)
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
