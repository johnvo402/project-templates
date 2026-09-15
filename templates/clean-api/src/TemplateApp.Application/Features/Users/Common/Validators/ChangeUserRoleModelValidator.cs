using FluentValidation;
using TemplateApp.Application.Authorization;
using TemplateApp.Application.Features.Users.Common.Models;

namespace TemplateApp.Application.Features.Users.Common.Validators;

public sealed class ChangeUserRoleModelValidator : AbstractValidator<ChangeUserRoleModel>
{
    public ChangeUserRoleModelValidator()
    {
        RuleFor(model => model.Role)
            .Must(AppRoles.IsValid)
            .WithMessage("Role must be Admin or User.");
    }
}
