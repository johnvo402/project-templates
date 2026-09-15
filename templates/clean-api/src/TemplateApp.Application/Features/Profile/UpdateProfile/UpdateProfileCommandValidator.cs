using FluentValidation;
using TemplateApp.Application.Features.Profile.Common.Models;

namespace TemplateApp.Application.Features.Profile.UpdateProfile;

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator(IValidator<UserProfileModel> modelValidator)
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
