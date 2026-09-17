namespace TemplateApp.Application.Features.Products.Images.Common.Projections;

public sealed record ProductImageProjection(Guid Id, string Url, bool IsPrimary, DateTimeOffset CreatedAt);
