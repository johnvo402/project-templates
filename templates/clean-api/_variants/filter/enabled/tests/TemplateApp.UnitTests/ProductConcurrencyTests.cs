using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TemplateApp.Domain.Products;
using TemplateApp.Infrastructure.Persistence;

namespace TemplateApp.UnitTests;

public sealed class ProductConcurrencyTests
{
    [Fact]
    public async Task SaveChanges_WhenProductWasModifiedByAnotherContext_ThrowsConcurrencyException()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var setupContext = new AppDbContext(options))
        {
            await setupContext.Database.EnsureCreatedAsync();
            setupContext.Products.Add(Product.Create("Keyboard", "KB-001", 49.90m, 10));
            await setupContext.SaveChangesAsync();
        }

        await using var firstContext = new AppDbContext(options);
        await using var secondContext = new AppDbContext(options);
        var first = await firstContext.Products.SingleAsync();
        var second = await secondContext.Products.SingleAsync();

        first.AdjustStock(-2);
        await firstContext.SaveChangesAsync();

        second.AdjustStock(-3);

        await Assert.ThrowsAsync<DbUpdateConcurrencyException>(
            () => secondContext.SaveChangesAsync());
    }
}
