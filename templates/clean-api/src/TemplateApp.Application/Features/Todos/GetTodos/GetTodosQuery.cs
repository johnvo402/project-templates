using Mediator;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Common.Projections.Todos;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public sealed record GetTodosQuery(int Page = 1, int PageSize = 20)
    : IQuery<Result<PaginationResponse<TodoProjection>>>;
