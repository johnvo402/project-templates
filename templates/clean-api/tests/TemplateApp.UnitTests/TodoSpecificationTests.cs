using TemplateApp.Application.Features.Todos.GetTodos;
using TemplateApp.Domain.Todos;
using TemplateApp.Domain.Todos.Specifications;

namespace TemplateApp.UnitTests;

public sealed class TodoSpecificationTests
{
    [Fact]
    public void TodoByIdSpecification_ShouldContainIdCriteria()
    {
        var id = TodoId.New();
        var specification = new TodoByIdSpecification(id);
        Assert.Single(specification.Criteria);
        Assert.False(specification.IsNoTracking);
    }

    [Fact]
    public void ListTodosSpecification_ShouldFilterSortAndUseNoTrackingWithoutOwningPagination()
    {
        var specification = new ListTodosSpecification(isCompleted: false);
        Assert.Single(specification.Criteria);
        Assert.False(specification.IsPagingEnabled);
        Assert.NotNull(specification.OrderByDescending);
        Assert.True(specification.IsNoTracking);
    }

    [Fact]
    public void GetTodosMapping_ShouldExposeEfTranslatableSelector()
    {
        var selector = GetTodosMapping.Selector();
        Assert.NotNull(selector);
        Assert.Equal(typeof(TodoItem), selector.Parameters.Single().Type);
        Assert.Equal(typeof(GetTodosResponse), selector.ReturnType);
    }
}
