using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Todos.Specifications;

public sealed class ListTodosSpecification : Specification<TodoItem>
{
    public ListTodosSpecification(bool? isCompleted = null)
    {
        if (isCompleted is not null)
            Query.Where(todo => todo.IsCompleted == isCompleted.Value);

        Query.OrderByDescending(todo => todo.CreatedAtUtc).AsNoTracking();
    }
}
