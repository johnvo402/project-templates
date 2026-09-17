using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
#if REDIS
using TemplateApp.Application.Abstractions.Persistence;
#endif

namespace TemplateApp.Application.Features.Products.Common;

public sealed record ProductCacheVersion(string Value);

public static class ProductCache
{
    private const string VersionKey = "products:version";
    public static readonly TimeSpan QueryExpiration = TimeSpan.FromMinutes(2);
    private static readonly TimeSpan VersionExpiration = TimeSpan.FromDays(7);

    public static string BuildQueryKey(string version, object request)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(version);
        ArgumentNullException.ThrowIfNull(request);

        var payload = JsonSerializer.Serialize(request);
        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();
        return $"products:list:{version}:{hash}";
    }

#if REDIS
    public static async Task<string> GetVersionAsync(
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken = default)
    {
        var cache = unitOfWork.CacheRepository<ProductCacheVersion>();
        var current = await cache.GetAsync(VersionKey, cancellationToken);
        if (current is not null)
            return current.Value;

        current = NewVersion();
        await cache.SetAsync(VersionKey, current, VersionExpiration, cancellationToken);
        return current.Value;
    }

    public static Task InvalidateAsync(
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken = default)
        => unitOfWork.CacheRepository<ProductCacheVersion>()
            .SetAsync(VersionKey, NewVersion(), VersionExpiration, cancellationToken);

    private static ProductCacheVersion NewVersion()
        => new(Guid.NewGuid().ToString("N"));
#endif
}
