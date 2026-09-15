using System.Security.Cryptography;
using System.Text;

namespace TemplateApp.Infrastructure.Security;

public sealed class SecureRefreshTokenFactory
{
    public string Create()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    public string Hash(string token)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash);
    }
}
