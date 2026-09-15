using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TemplateApp.Infrastructure.Persistence;

namespace TemplateApp.Infrastructure;

public static class DatabaseMigrationExtensions
{
    private const int MaxStartupAttempts = 30;
    private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(2);

    public static async Task ApplyDatabaseMigrationsAsync(
        this IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        var enabledValue = configuration["Database:AutoMigrate"];
        var enabled = !bool.TryParse(enabledValue, out var parsed) || parsed;

        if (!enabled)
            return;

        var logger = services
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("DatabaseMigration");

        for (var attempt = 1; attempt <= MaxStartupAttempts; attempt++)
        {
            try
            {
                using var scope = services.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var pending = (await dbContext.Database
                    .GetPendingMigrationsAsync(cancellationToken))
                    .ToArray();

                if (pending.Length == 0)
                {
                    logger.LogInformation("Database schema is up to date.");
                    return;
                }

                logger.LogInformation(
                    "Applying {MigrationCount} pending database migration(s): {Migrations}",
                    pending.Length,
                    string.Join(", ", pending));

                await dbContext.Database.MigrateAsync(cancellationToken);
                logger.LogInformation("Database migrations applied successfully.");
                return;
            }
            catch (Exception exception) when (
                attempt < MaxStartupAttempts && IsTransientStartupFailure(exception))
            {
                logger.LogWarning(
                    exception,
                    "Database is not ready yet. Startup migration attempt {Attempt}/{MaxAttempts} failed with a transient connection error. Retrying in {DelaySeconds}s.",
                    attempt,
                    MaxStartupAttempts,
                    RetryDelay.TotalSeconds);

                await Task.Delay(RetryDelay, cancellationToken);
            }
            catch (Exception exception)
            {
                logger.LogCritical(
                    exception,
                    "Database migration failed with a non-transient schema error. Startup will stop instead of retrying. " +
                    "If this is a disposable development database whose schema no longer matches __EFMigrationsHistory, recreate the database/volume before starting again.");
                throw;
            }
        }
    }

    private static bool IsTransientStartupFailure(Exception exception)
    {
        if (exception is TimeoutException)
            return true;

        if (exception is DbException dbException)
        {
            if (dbException.IsTransient)
                return true;

            var sqlState = dbException.SqlState;

            // PostgreSQL SQLSTATE class 08 = connection exception.
            // 57P03 = cannot_connect_now, 53300/53400 = temporary resource pressure.
            if (!string.IsNullOrWhiteSpace(sqlState) &&
                (sqlState.StartsWith("08", StringComparison.Ordinal) ||
                 sqlState is "57P03" or "53300" or "53400"))
            {
                return true;
            }

            // Keep the base template provider-neutral while still handling the most
            // common SQL Server startup/connectivity errors.
            if (dbException.GetType().FullName == "Microsoft.Data.SqlClient.SqlException" &&
                TryGetSqlServerErrorNumber(dbException, out var number))
            {
                return number is -2 or 20 or 53 or 64 or 233 or 258 or 4060 or
                    40197 or 40501 or 40613 or 49918 or 49919 or 49920 or
                    10053 or 10054 or 10060 or 11001;
            }
        }

        return exception.InnerException is not null &&
            IsTransientStartupFailure(exception.InnerException);
    }

    private static bool TryGetSqlServerErrorNumber(DbException exception, out int number)
    {
        var property = exception.GetType().GetProperty("Number");
        if (property?.GetValue(exception) is int value)
        {
            number = value;
            return true;
        }

        number = default;
        return false;
    }
}
