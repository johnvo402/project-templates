using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Common.Projections.Todos;
using TemplateApp.Domain.Todos;
using TemplateApp.Domain.Todos.Specifications;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public sealed class GetTodosQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetTodosQuery, Result<PaginationResponse<TodoProjection>>>
{
    public async ValueTask<Result<PaginationResponse<TodoProjection>>> Handle(
        GetTodosQuery request,
        CancellationToken cancellationToken)
    {
        var data = await unitOfWork.ReadOnlyRepository<TodoItem>().PagedListAsync(
            new ListTodosSpecification(),
            TodoProjection.MappingExpression,
            new PageParameters(request.Page, request.PageSize),
            cancellationToken);

        return Result<PaginationResponse<TodoProjection>>.Success(data);
    }
}
