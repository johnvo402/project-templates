namespace TemplateApp.Infrastructure.Storage;

public sealed class MinioOptions
{
    public const string SectionName = "Minio";

    // Internal endpoint used by the API container/server for object operations.
    public string Endpoint { get; init; } = "localhost:9000";

    // Browser-reachable endpoint used only when generating presigned URLs.
    // Falls back to Endpoint when omitted. Do not include http:// or https://.
    public string? PublicEndpoint { get; init; }

    public string AccessKey { get; init; } = "minioadmin";
    public string SecretKey { get; init; } = "minioadmin";
    public string Bucket { get; init; } = "templateapp";

    // TLS settings can differ internally vs publicly when a reverse proxy terminates TLS.
    public bool Secure { get; init; }
    public bool? PublicSecure { get; init; }

    public int PresignedExpirySeconds { get; init; } = 900;
}
