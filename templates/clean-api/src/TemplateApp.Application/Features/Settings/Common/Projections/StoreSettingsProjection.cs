namespace TemplateApp.Application.Features.Settings.Common.Projections;

public sealed record StoreSettingsProjection(
    string StoreName,
    string? StoreEmail,
    string? StorePhone,
    string Currency,
    string Timezone,
    int LowStockThreshold,
    DateTimeOffset UpdatedAt);
