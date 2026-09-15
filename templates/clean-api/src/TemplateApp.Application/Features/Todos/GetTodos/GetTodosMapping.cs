using System.Linq.Expressions;
using TemplateApp.Domain.Todos;

namespace TemplateApp.Application.Features.Todos.GetTodos;

public static class GetTodosMapping
{
    public static Expression<Func<TodoItem, GetTodosResponse>> Selector() =>
        todo => new GetTodosResponse
        {
            Id = todo.Id.Value,
            Title = todo.Title.Value,
            IsCompleted = todo.IsCompleted,
            CreatedAtUtc = todo.CreatedAtUtc,
            CompletedAtUtc = todo.CompletedAtUtc
        };
}
