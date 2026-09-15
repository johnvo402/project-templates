using FluentValidation;
using TemplateApp.Application.Features.Auth.Common.Models;

namespace TemplateApp.Application.Features.Auth.Common.Validators;

public sealed class RegisterModelValidator : AbstractValidator<RegisterModel>
{
    public RegisterModelValidator()
    {
        RuleFor(model => model.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(model => model.Password).NotEmpty().MinimumLength(12).MaximumLength(128);
        RuleFor(model => model.DisplayName).NotEmpty().MaximumLength(120);
    }
}
