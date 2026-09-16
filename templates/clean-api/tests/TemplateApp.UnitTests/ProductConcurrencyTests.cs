using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TemplateApp.Application.Common.Exceptions;
using TemplateApp.Domain.Products;
using TemplateApp.Infrastructure.Persistence;

namespace TemplateApp.UnitTests;

public sealed class ProductConcurrencyTests
{
    [Fact]
    public async Task SaveChangesAsync_WhenTwoWritersChangeStock_RejectsStaleWriter()
    {
        await using var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        var product = Product.Create("Keyboard", "KB-001", 49.90m, 10);

        await using (var seedContext = new AppDbContext(options))
        {
            await seedContext.Database.EnsureCreatedAsync();
            seedContext.Products.Add(product);
            await seedContext.SaveChangesAsync();
        }

        await using var firstContext = new AppDbContext(options);
        await using var secondContext = new AppDbContext(options);

        var firstWriter = await firstContext.Products.SingleAsync(x => x.Id == product.Id);
        var staleWriter = await secondContext.Products.SingleAsync(x => x.Id == product.Id);

        firstWriter.AdjustStock(-3);
        await firstContext.SaveChangesAsync();

        staleWriter.AdjustStock(-2);
        await using var staleUnitOfWork = new UnitOfWork(secondContext);

        var exception = await Assert.ThrowsAsync<PersistenceConcurrencyException>(
            () => staleUnitOfWork.SaveChangesAsync());

        Assert.Equal("The resource was modified by another request. Reload and retry.", exception.Message);
        Assert.NotNull(exception.InnerException);

        await using var verificationContext = new AppDbContext(options);
        var persisted = await verificationContext.Products.AsNoTracking().SingleAsync(x => x.Id == product.Id);
        Assert.Equal(7, persisted.StockQuantity);
    }
}
