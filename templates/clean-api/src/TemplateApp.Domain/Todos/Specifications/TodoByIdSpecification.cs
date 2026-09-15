using TemplateApp.Domain.Common.Specifications;

namespace TemplateApp.Domain.Todos.Specifications;

public sealed class TodoByIdSpecification : Specification<TodoItem>
{
    public TodoByIdSpecification(TodoId id, bool asNoTracking = false)
    {
        Query.Where(todo => todo.Id == id);

        if (asNoTracking)
            Query.AsNoTracking();
    }
}
