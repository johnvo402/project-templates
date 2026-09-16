using FluentValidation;

namespace TemplateApp.Application.Features.Employees.GetEmployees;

public sealed class GetEmployeesQueryValidator : AbstractValidator<GetEmployeesQuery>
{
    public GetEmployeesQueryValidator()
    {
        RuleFor(query => query.Query.NormalizedPage).GreaterThan(0);
        RuleFor(query => query.Query.NormalizedPageSize).InclusiveBetween(1, 100);
    }
}
