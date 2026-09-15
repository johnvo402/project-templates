using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TemplateApp.Application.Common.Querying;
using TemplateApp.Application.Features.Products.GetProducts;
using TemplateApp.Domain.Common.Specifications;
using TemplateApp.Domain.Products;
using TemplateApp.Domain.Products.Specifications;
using TemplateApp.Infrastructure.Persistence;
using TemplateApp.Infrastructure.Persistence.Repositories;

namespace TemplateApp.UnitTests;

public sealed class LhsQueryTranslationTests
{
    [Fact]
    public async Task ContainsI_on_product_name_executes_in_database_query()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var dbContext = new AppDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();

        dbContext.Products.AddRange(
            Product.Create("SS regression", "SKU-SS", 10m, 5),
            Product.Create("unrelated", "SKU-OTHER", 20m, 3));
        await dbContext.SaveChangesAsync();

        var filter = new FilterGroup(
            FilterLogicalOperator.And,
            [new FilterCondition("Name", FilterOperator.ContainsI, ["ss"])]);

        var query = new QueryParameters(
            Page: 1,
            PageSize: 10,
            Filter: filter);

        var repository = new EfReadRepository<Product>(dbContext);
        var page = await repository.PagedListAsync(
            new NoSortProductSpecification(),
            GetProductsMapping.Selector(),
            query);

        var product = Assert.Single(page.Data);
        Assert.Equal("SS regression", product.Name);
    }

    [Fact]
    public void Specification_sort_keeps_the_real_key_type()
    {
        var specification = new ListProductsSpecification();

        Assert.NotNull(specification.OrderByDescending);
        Assert.Equal(typeof(DateTimeOffset), specification.OrderByDescending!.ReturnType);
        Assert.NotEqual(System.Linq.Expressions.ExpressionType.Convert, specification.OrderByDescending.Body.NodeType);
    }

    private sealed class NoSortProductSpecification : Specification<Product>
    {
        public NoSortProductSpecification()
        {
            Query.AsNoTracking();
        }
    }
}
