using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using TemplateApp.Application.Abstractions.Storage;

namespace TemplateApp.Infrastructure.Storage;

public sealed class MinioObjectStorage : IObjectStorage
{
    private readonly MinioOptions _options;
    private readonly IMinioClient _internalClient;
    private readonly IMinioClient _publicPresignClient;

    public MinioObjectStorage(IOptions<MinioOptions> options)
    {
        _options = options.Value;

        _internalClient = BuildClient(
            _options.Endpoint,
            _options.Secure);

        _publicPresignClient = BuildClient(
            string.IsNullOrWhiteSpace(_options.PublicEndpoint)
                ? _options.Endpoint
                : _options.PublicEndpoint,
            _options.PublicSecure ?? _options.Secure);
    }

    public async Task UploadAsync(
        string objectName,
        Stream content,
        long size,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);
        var args = new PutObjectArgs()
            .WithBucket(_options.Bucket)
            .WithObject(objectName)
            .WithStreamData(content)
            .WithObjectSize(size)
            .WithContentType(contentType);
        await _internalClient.PutObjectAsync(args, cancellationToken);
    }

    public async Task DeleteAsync(string objectName, CancellationToken cancellationToken = default)
    {
        var args = new RemoveObjectArgs()
            .WithBucket(_options.Bucket)
            .WithObject(objectName);
        await _internalClient.RemoveObjectAsync(args, cancellationToken);
    }

    public async Task<string> GetPresignedDownloadUrlAsync(
        string objectName,
        TimeSpan? expiresIn = null,
        CancellationToken cancellationToken = default)
    {
        await EnsureBucketAsync(cancellationToken);
        var args = new PresignedGetObjectArgs()
            .WithBucket(_options.Bucket)
            .WithObject(objectName)
            .WithExpiry(ToExpirySeconds(expiresIn));
        return await _publicPresignClient.PresignedGetObjectAsync(args);
    }


    private async Task EnsureBucketAsync(CancellationToken cancellationToken)
    {
        var exists = await _internalClient.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(_options.Bucket),
            cancellationToken);
        if (!exists)
        {
            await _internalClient.MakeBucketAsync(
                new MakeBucketArgs().WithBucket(_options.Bucket),
                cancellationToken);
        }
    }

    private IMinioClient BuildClient(string endpoint, bool secure)
    {
        return new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(_options.AccessKey, _options.SecretKey)
            .WithSSL(secure)
            .Build();
    }

    private int ToExpirySeconds(TimeSpan? expiresIn)
    {
        var seconds = (int)(expiresIn ?? TimeSpan.FromSeconds(_options.PresignedExpirySeconds)).TotalSeconds;
        return Math.Clamp(seconds, 1, 604800);
    }
}
