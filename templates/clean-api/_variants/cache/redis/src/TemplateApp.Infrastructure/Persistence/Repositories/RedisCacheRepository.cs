using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using TemplateApp.Application.Abstractions.Persistence;

namespace TemplateApp.Infrastructure.Persistence.Repositories;

internal sealed class RedisCacheRepository<TValue>(IDistributedCache cache) : ICacheRepository<TValue>
    where TValue : class
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(10);

    public async Task<TValue?> GetAsync(
        string key,
        CancellationToken cancellationToken = default)
    {
        var payload = await cache.GetStringAsync(BuildKey(key), cancellationToken);
        return payload is null
            ? null
            : JsonSerializer.Deserialize<TValue>(payload, JsonOptions);
    }

    public async Task SetAsync(
        string key,
        TValue value,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(value);

        var payload = JsonSerializer.Serialize(value, JsonOptions);
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? DefaultExpiration
        };

        await cache.SetStringAsync(BuildKey(key), payload, options, cancellationToken);
    }

    public async Task<TValue> GetOrCreateAsync(
        string key,
        Func<CancellationToken, Task<TValue>> factory,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(factory);

        var cached = await GetAsync(key, cancellationToken);
        if (cached is not null)
            return cached;

        var value = await factory(cancellationToken);
        await SetAsync(key, value, expiration, cancellationToken);
        return value;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        => cache.RemoveAsync(BuildKey(key), cancellationToken);

    private static string BuildKey(string key)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        return $"{typeof(TValue).FullName}:{key}";
    }
}
