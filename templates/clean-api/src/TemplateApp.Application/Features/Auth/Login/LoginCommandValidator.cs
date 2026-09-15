using FluentValidation;
using TemplateApp.Application.Features.Auth.Common.Models;

namespace TemplateApp.Application.Features.Auth.Login;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator(IValidator<LoginModel> modelValidator)
    {
        RuleFor(command => command.Model).NotNull();
        RuleFor(command => command.Model).SetValidator(modelValidator);
    }
}
