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
    public async ValueTask<Result<PaginationResponse<TodoProjection>>> Handle(GetTodosQuery request, CancellationToken cancellationToken)
    {
        var page = await unitOfWork.ReadOnlyRepository<TodoItem>().PagedListAsync(
            new ListTodosSpecification(),
            TodoProjection.MappingExpression,
            request.Query,
            cancellationToken);
        return Result<PaginationResponse<TodoProjection>>.Success(page);
    }
}
