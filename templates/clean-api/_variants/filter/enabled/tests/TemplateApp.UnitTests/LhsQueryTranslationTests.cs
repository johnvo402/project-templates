using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Features.Todos.GetTodos;
using TemplateApp.Domain.Common.Specifications;
using TemplateApp.Domain.Todos;
using TemplateApp.Domain.Todos.Specifications;
using TemplateApp.Infrastructure.Persistence;
using TemplateApp.Infrastructure.Persistence.Repositories;

namespace TemplateApp.UnitTests;

public sealed class LhsQueryTranslationTests
{
    [Fact]
    public async Task ContainsI_on_owned_value_object_executes_in_database_query()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var dbContext = new AppDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();

        dbContext.Todos.AddRange(
            TodoItem.Create("SS regression"),
            TodoItem.Create("unrelated"));
        await dbContext.SaveChangesAsync();

        var filter = new FilterGroup(
            FilterLogicalOperator.And,
            [new FilterCondition("Title", FilterOperator.ContainsI, ["ss"])]);

        var query = new QueryParameters(
            Page: 1,
            PageSize: 10,
            Filter: filter);

        var repository = new EfReadRepository<TodoItem>(dbContext);
        var page = await repository.PagedListAsync(
            new NoSortTodoSpecification(),
            GetTodosMapping.Selector(),
            query);

        var todo = Assert.Single(page.Data);
        Assert.Equal("SS regression", todo.Title);
    }

    [Fact]
    public void Specification_sort_keeps_the_real_key_type()
    {
        var specification = new ListTodosSpecification();

        Assert.NotNull(specification.OrderByDescending);
        Assert.Equal(typeof(DateTimeOffset), specification.OrderByDescending!.ReturnType);
        Assert.NotEqual(System.Linq.Expressions.ExpressionType.Convert, specification.OrderByDescending.Body.NodeType);
    }

    private sealed class NoSortTodoSpecification : Specification<TodoItem>
    {
        public NoSortTodoSpecification()
        {
            Query.AsNoTracking();
        }
    }
}
