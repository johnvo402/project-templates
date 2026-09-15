using FluentValidation;
using TemplateApp.Application.Authorization;

namespace TemplateApp.Application.Features.Users.ChangeUserRole;

public sealed class ChangeUserRoleCommandValidator : AbstractValidator<ChangeUserRoleCommand>
{
    public ChangeUserRoleCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Model.Role)
            .Must(AppRoles.IsValid)
            .WithMessage("Role must be Admin or User.");
    }
}
