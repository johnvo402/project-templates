using FluentValidation;

namespace TemplateApp.Application.Features.Auth.Login;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(command => command.Model.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(command => command.Model.Password).NotEmpty();
    }
}
