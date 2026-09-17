using Mediator;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Employees.Common.Projections;

namespace TemplateApp.Application.Features.Employees.GetEmployees;

public sealed record GetEmployeesQuery(PageParameters Page, string? Role = null, bool? IsActive = null)
    : IQuery<Result<PaginationResponse<EmployeeProjection>>>;
