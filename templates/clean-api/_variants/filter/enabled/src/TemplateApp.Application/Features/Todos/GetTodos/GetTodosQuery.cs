using Mediator;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public sealed record GetTodosQuery(QueryParameters Query)
    : IQuery<Result<PaginationResponse<GetTodosResponse>>>;
