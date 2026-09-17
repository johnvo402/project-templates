using FluentValidation;
using TemplateApp.Application.Authorization;

namespace TemplateApp.Application.Features.Employees.ChangeEmployeeRole;

public sealed class ChangeEmployeeRoleCommandValidator : AbstractValidator<ChangeEmployeeRoleCommand>
{
    public ChangeEmployeeRoleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Model.Role).Must(AppRoles.IsValid).WithMessage("Role must be Admin, Manager or Staff.");
    }
}
