namespace TemplateApp.Application.Abstractions.Storage;

public interface IObjectStorage
{
    Task UploadAsync(
        string objectName,
        Stream content,
        long size,
        string contentType,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(string objectName, CancellationToken cancellationToken = default);

    Task<string> GetPresignedDownloadUrlAsync(
        string objectName,
        TimeSpan? expiresIn = null,
        CancellationToken cancellationToken = default);
}
