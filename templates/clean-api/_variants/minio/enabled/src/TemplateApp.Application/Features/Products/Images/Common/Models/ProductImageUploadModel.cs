namespace TemplateApp.Application.Features.Products.Images.Common.Models;

public sealed record ProductImageUploadModel(string FileName, string ContentType, byte[] Content);
