using Mediator;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Common.Projections.Todos;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public sealed record GetTodosQuery(QueryParameters Query)
    : IQuery<Result<PaginationResponse<TodoProjection>>>;
