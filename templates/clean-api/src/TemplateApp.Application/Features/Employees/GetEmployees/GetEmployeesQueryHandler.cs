using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Employees.Common.Projections;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Employees.GetEmployees;

public sealed class GetEmployeesQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetEmployeesQuery, Result<PaginationResponse<EmployeeProjection>>>
{
    public async ValueTask<Result<PaginationResponse<EmployeeProjection>>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        var employees = await unitOfWork.ReadOnlyRepository<AppUser>().PagedListAsync(
            new ListEmployeesSpecification(request.Role, request.IsActive),
            GetEmployeesMapping.Selector(),
            request.Page,
            cancellationToken);
        return Result<PaginationResponse<EmployeeProjection>>.Success(employees);
    }
}
