using FluentValidation;
using TemplateApp.Application.Authorization;

namespace TemplateApp.Application.Features.Employees.GetEmployees;

public sealed class GetEmployeesQueryValidator : AbstractValidator<GetEmployeesQuery>
{
    public GetEmployeesQueryValidator()
    {
        RuleFor(x => x.Page.Page).GreaterThan(0);
        RuleFor(x => x.Page.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.Role).Must(role => string.IsNullOrWhiteSpace(role) || AppRoles.IsValid(role))
            .WithMessage("Role must be Admin, Manager or Staff.");
    }
}
