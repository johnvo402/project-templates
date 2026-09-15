using FluentValidation;
using TemplateApp.Application.Authorization;
using TemplateApp.Application.Features.Employees.Common.Models;

namespace TemplateApp.Application.Features.Employees.Common.Validators;

public sealed class CreateEmployeeModelValidator : AbstractValidator<CreateEmployeeModel>
{
    public CreateEmployeeModelValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(12);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Role).Must(AppRoles.IsValid).WithMessage("Role must be Admin, Manager or Staff.");
    }
}
