using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Domain.Todos;
using TemplateApp.Domain.Todos.Specifications;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public sealed class GetTodosHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetTodosQuery, Result<PaginationResponse<GetTodosResponse>>>
{
    public async ValueTask<Result<PaginationResponse<GetTodosResponse>>> Handle(
        GetTodosQuery request,
        CancellationToken cancellationToken)
    {
        var page = await unitOfWork.ReadOnlyRepository<TodoItem>().PagedListAsync(
            new ListTodosSpecification(),
            GetTodosMapping.Selector(),
            request.Query,
            cancellationToken);

        return Result<PaginationResponse<GetTodosResponse>>.Success(page);
    }
}
