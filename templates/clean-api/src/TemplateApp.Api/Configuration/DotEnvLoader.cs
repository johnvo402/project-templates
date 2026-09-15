namespace TemplateApp.Api.Configuration;

public static class DotEnvLoader
{
    private static readonly (string Alias, string Canonical)[] Aliases =
    [
        ("AUTO_MIGRATE", "Database__AutoMigrate"),
        ("DB_CONNECTION", "ConnectionStrings__Default"),
        ("JWT_ISSUER", "Jwt__Issuer"),
        ("JWT_AUDIENCE", "Jwt__Audience"),
        ("JWT_KEY", "Jwt__Key"),
        ("JWT_EXPIRATION_MINUTES", "Jwt__ExpirationMinutes"),
        ("REFRESH_TOKEN_DAYS", "Auth__RefreshTokenDays"),
        ("REFRESH_COOKIE_NAME", "Auth__RefreshCookieName"),
        ("REDIS_CONNECTION", "Redis__Configuration"),
        ("REDIS_INSTANCE_NAME", "Redis__InstanceName"),
        ("MINIO_ENDPOINT", "Minio__Endpoint"),
        ("MINIO_PUBLIC_ENDPOINT", "Minio__PublicEndpoint"),
        ("MINIO_ACCESS_KEY", "Minio__AccessKey"),
        ("MINIO_SECRET_KEY", "Minio__SecretKey"),
        ("MINIO_BUCKET", "Minio__Bucket"),
        ("MINIO_SECURE", "Minio__Secure"),
        ("MINIO_PUBLIC_SECURE", "Minio__PublicSecure"),
        ("MINIO_PRESIGNED_EXPIRY_SECONDS", "Minio__PresignedExpirySeconds"),
        ("GEMINI_API_KEY", "Gemini__ApiKey"),
        ("GEMINI_MODEL", "Gemini__Model"),
        ("OPENAI_API_KEY", "OpenAI__ApiKey"),
        ("OPENAI_MODEL", "OpenAI__Model")
    ];

    public static void Load()
    {
        var path = FindDotEnv();
        if (path is not null)
            LoadFile(path);

        MapAliases();
    }

    private static void LoadFile(string path)
    {
        foreach (var rawLine in File.ReadLines(path))
        {
            var line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith('#'))
                continue;

            if (line.StartsWith("export ", StringComparison.OrdinalIgnoreCase))
                line = line[7..].TrimStart();

            var separator = line.IndexOf('=');
            if (separator <= 0)
                continue;

            var key = line[..separator].Trim();
            var value = line[(separator + 1)..].Trim();
            if (key.Length == 0 || Environment.GetEnvironmentVariable(key) is not null)
                continue;

            if (value.Length >= 2 &&
                ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
            {
                value = value[1..^1];
            }

            Environment.SetEnvironmentVariable(key, value);
        }
    }

    private static void MapAliases()
    {
        foreach (var (alias, canonical) in Aliases)
        {
            if (Environment.GetEnvironmentVariable(canonical) is not null)
                continue;

            var value = Environment.GetEnvironmentVariable(alias);
            if (!string.IsNullOrWhiteSpace(value))
                Environment.SetEnvironmentVariable(canonical, value);
        }
    }

    private static string? FindDotEnv()
    {
        foreach (var start in new[] { Directory.GetCurrentDirectory(), AppContext.BaseDirectory }.Distinct())
        {
            var directory = new DirectoryInfo(start);
            for (var depth = 0; directory is not null && depth < 10; depth++, directory = directory.Parent)
            {
                var candidate = Path.Combine(directory.FullName, ".env");
                if (File.Exists(candidate))
                    return candidate;
            }
        }

        return null;
    }
}
