using FluentValidation;
using TemplateApp.Application.Features.Auth.Common.Models;

namespace TemplateApp.Application.Features.Auth.Register;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator(IValidator<RegisterModel> modelValidator)
    {
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
