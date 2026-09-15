using FluentValidation;
using TemplateApp.Application.Features.Auth.Common.Models;

namespace TemplateApp.Application.Features.Auth.Common.Validators;

public sealed class LoginModelValidator : AbstractValidator<LoginModel>
{
    public LoginModelValidator()
    {
        RuleFor(model => model.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(model => model.Password).NotEmpty();
    }
}
