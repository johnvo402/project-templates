namespace TemplateApp.Application.Features.Profile.Avatar;

public sealed record AvatarUploadModel(string FileName, string ContentType, byte[] Content);
