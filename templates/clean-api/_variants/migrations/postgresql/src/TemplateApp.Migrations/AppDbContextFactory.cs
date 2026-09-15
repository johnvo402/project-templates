using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using TemplateApp.Infrastructure.Persistence;

namespace TemplateApp.Migrations;

public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = FirstNotBlank(
            Environment.GetEnvironmentVariable("ConnectionStrings__Default"),
            Environment.GetEnvironmentVariable("DB_CONNECTION"),
            "Host=localhost;Port=5432;Database=TemplateApp;Username=postgres;Password=postgres");

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

        optionsBuilder.UseNpgsql(
            connectionString,
            options => options.MigrationsAssembly(typeof(AppDbContext).Assembly.GetName().Name));

        return new AppDbContext(optionsBuilder.Options);
    }

    private static string FirstNotBlank(params string?[] values)
        => values.First(value => !string.IsNullOrWhiteSpace(value))!;
}
