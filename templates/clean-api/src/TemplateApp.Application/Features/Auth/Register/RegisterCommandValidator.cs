using FluentValidation;

namespace TemplateApp.Application.Features.Auth.Register;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(command => command.Model.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(command => command.Model.Password).NotEmpty().MinimumLength(12).MaximumLength(128);
        RuleFor(command => command.Model.DisplayName).NotEmpty().MaximumLength(120);
    }
}
