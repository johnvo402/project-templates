using TemplateApp.Application.Features.Todos.Common.Projections;
using TemplateApp.Domain.Todos;

namespace TemplateApp.Application.Features.Todos.Common.Mappings;

public static class TodoMapping
{
    public static TodoProjection ToTodo(this TodoItem todo)
    {
        var projection = new TodoProjection();
        projection.MappingFrom(todo);
        return projection;
    }

    public static IReadOnlyList<TodoProjection> ToTodoList(this IEnumerable<TodoItem> todos)
        => todos.Select(todo => todo.ToTodo()).ToList();
}
