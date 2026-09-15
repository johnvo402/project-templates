using Mediator;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Abstractions.Storage;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.Profile.Common.Projections;
using TemplateApp.Domain.Identity;
using TemplateApp.Domain.Identity.Specifications;

namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed class UploadAvatarCommandHandler(IUnitOfWork unitOfWork, IObjectStorage storage)
    : ICommandHandler<UploadAvatarCommand, Result<AvatarProjection>>
{
    public async ValueTask<Result<AvatarProjection>> Handle(UploadAvatarCommand command, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Repository<AppUser>().FirstOrDefaultAsync(
            new UserByIdSpecification(new UserId(command.UserId)), cancellationToken);
        if (user is null)
            return Result<AvatarProjection>.Failure(new Error("profile.not_found", "Profile was not found.", ErrorType.NotFound));

        var extension = command.Model.ContentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".bin"
        };
        var objectName = $"avatars/{command.UserId:N}/{Guid.NewGuid():N}{extension}";
        var previous = user.AvatarObjectName;

        await using var stream = new MemoryStream(command.Model.Content, writable: false);
        await storage.UploadAsync(objectName, stream, command.Model.Content.LongLength, command.Model.ContentType, cancellationToken);

        try
        {
            user.SetAvatar(objectName);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            await storage.DeleteAsync(objectName, cancellationToken);
            throw;
        }

        if (!string.IsNullOrWhiteSpace(previous) && !string.Equals(previous, objectName, StringComparison.Ordinal))
        {
            try { await storage.DeleteAsync(previous, cancellationToken); }
            catch { }
        }

        var url = await storage.GetPresignedDownloadUrlAsync(objectName, cancellationToken: cancellationToken);
        return Result<AvatarProjection>.Success(new AvatarProjection(url));
    }
}
