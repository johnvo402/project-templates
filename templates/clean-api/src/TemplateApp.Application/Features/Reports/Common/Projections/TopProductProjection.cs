namespace TemplateApp.Application.Features.Reports.Common.Projections;

public sealed record TopProductProjection(
    Guid ProductId,
    string ProductName,
    int Quantity,
    decimal Revenue);
