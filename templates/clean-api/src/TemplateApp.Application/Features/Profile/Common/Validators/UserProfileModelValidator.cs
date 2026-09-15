using FluentValidation;
using TemplateApp.Application.Features.Profile.Common.Models;

namespace TemplateApp.Application.Features.Profile.Common.Validators;

public sealed class UserProfileModelValidator : AbstractValidator<UserProfileModel>
{
    public UserProfileModelValidator()
    {
        RuleFor(model => model.DisplayName).NotEmpty().MaximumLength(120);
        RuleFor(model => model.Bio).MaximumLength(500);
    }
}
