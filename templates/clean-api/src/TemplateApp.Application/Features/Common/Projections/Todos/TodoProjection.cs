using System.Linq.Expressions;
using TemplateApp.Domain.Todos;

namespace TemplateApp.Application.Features.Common.Projections.Todos;

public sealed record TodoProjection(
    Guid Id,
    string Title,
    bool IsCompleted,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? CompletedAtUtc)
{
    public static Expression<Func<TodoItem, TodoProjection>> MappingExpression => todo => new TodoProjection(
        todo.Id.Value,
        todo.Title.Value,
        todo.IsCompleted,
        todo.CreatedAtUtc,
        todo.CompletedAtUtc);
}
