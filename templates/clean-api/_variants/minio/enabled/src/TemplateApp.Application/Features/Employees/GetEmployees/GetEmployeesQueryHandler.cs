using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Employees.Common.Projections;
using TemplateApp.Application.Features.Employees.Common.Services;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Employees.GetEmployees;

public sealed class GetEmployeesQueryHandler(
    IUnitOfWork unitOfWork,
    IEmployeeAvatarUrlResolver avatarUrlResolver)
    : IQueryHandler<GetEmployeesQuery, Result<PaginationResponse<EmployeeProjection>>>
{
    public async ValueTask<Result<PaginationResponse<EmployeeProjection>>> Handle(
        GetEmployeesQuery request,
        CancellationToken cancellationToken)
    {
//#if (filter)
        var employees = await unitOfWork.ReadOnlyRepository<AppUser>().PagedListAsync(
            new ListEmployeesSpecification(),
            GetEmployeesMapping.Selector(),
            request.Query,
            cancellationToken);
//#else
        var employees = await unitOfWork.ReadOnlyRepository<AppUser>().PagedListAsync(
            new ListEmployeesSpecification(request.Role, request.IsActive),
            GetEmployeesMapping.Selector(),
            request.Page,
            cancellationToken);
//#endif

        var enriched = new List<EmployeeProjection>(employees.Data.Count);
        foreach (var employee in employees.Data)
        {
            var avatarUrl = await avatarUrlResolver.ResolveAsync(employee.AvatarObjectName, cancellationToken);
            enriched.Add(employee with { AvatarUrl = avatarUrl });
        }

        return Result<PaginationResponse<EmployeeProjection>>.Success(employees.WithData(enriched));
    }
}
