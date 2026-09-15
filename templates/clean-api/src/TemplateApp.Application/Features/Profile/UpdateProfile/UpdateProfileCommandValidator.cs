using FluentValidation;

namespace TemplateApp.Application.Features.Profile.UpdateProfile;

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Model.DisplayName).NotEmpty().MaximumLength(120);
        RuleFor(command => command.Model.Bio).MaximumLength(500);
    }
}
