using TemplateApp.Application.Features.Common.Projections.Todos;
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
    public void TodoProjection_ShouldExposeEfTranslatableMappingExpression()
    {
        Assert.NotNull(TodoProjection.MappingExpression);
        Assert.Equal(typeof(TodoItem), TodoProjection.MappingExpression.Parameters.Single().Type);
    }
}
