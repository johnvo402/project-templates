namespace TemplateApp.Application.Features.Products.Common.Models;

public sealed record ProductImageModel(string FileName, string ContentType, byte[] Content);
