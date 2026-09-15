using FluentValidation;
using TemplateApp.Application.Features.Profile.Common.Models;

namespace TemplateApp.Application.Features.Profile.Common.Validators;

public sealed class AvatarUploadModelValidator : AbstractValidator<AvatarUploadModel>
{
    private const int MaxBytes = 5 * 1024 * 1024;
    private static readonly string[] AllowedTypes = ["image/jpeg", "image/png", "image/webp"];

    public AvatarUploadModelValidator()
    {
        RuleFor(model => model.FileName).NotEmpty().MaximumLength(255);
        RuleFor(model => model.ContentType)
            .Must(type => AllowedTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Avatar must be JPEG, PNG, or WebP.");
        RuleFor(model => model.Content)
            .NotEmpty()
            .Must(content => content.Length <= MaxBytes)
            .WithMessage("Avatar must be 5 MB or smaller.")
            .Must((model, content) => HasValidSignature(model.ContentType, content))
            .WithMessage("Avatar file content does not match its declared image type.");
    }

    private static bool HasValidSignature(string contentType, byte[] bytes)
    {
        if (bytes.Length < 12) return false;
        return contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,
            "image/png" => bytes.AsSpan(0, 8).SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
            "image/webp" => bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8) && bytes.AsSpan(8, 4).SequenceEqual("WEBP"u8),
            _ => false
        };
    }
}
