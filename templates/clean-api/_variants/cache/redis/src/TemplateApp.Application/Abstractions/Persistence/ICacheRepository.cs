namespace TemplateApp.Application.Abstractions.Persistence;

/// <summary>
/// Typed cache abstraction intended for projections/query results, not tracked domain aggregates.
/// </summary>
public interface ICacheRepository<TValue>
    where TValue : class
{
    Task<TValue?> GetAsync(string key, CancellationToken cancellationToken = default);

    Task SetAsync(
        string key,
        TValue value,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default);

    Task<TValue> GetOrCreateAsync(
        string key,
        Func<CancellationToken, Task<TValue>> factory,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default);

    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
}
