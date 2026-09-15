namespace TemplateApp.Application.Features.Profile.Common.Models;

public sealed record AvatarUploadModel(string FileName, string ContentType, byte[] Content);
