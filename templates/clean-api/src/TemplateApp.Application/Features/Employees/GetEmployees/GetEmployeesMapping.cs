using System.Linq.Expressions;
using TemplateApp.Application.Features.Employees.Common.Projections;
using TemplateApp.Domain.Identity;

namespace TemplateApp.Application.Features.Employees.GetEmployees;

public static class GetEmployeesMapping
{
    public static Expression<Func<AppUser, EmployeeProjection>> Selector()
        => user => new EmployeeProjection(
            user.Id.Value,
            user.Email,
            user.DisplayName,
            user.Role,
            user.IsActive,
            user.CreatedAtUtc);
}
