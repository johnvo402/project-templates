namespace TemplateApp.Application.Features.Settings.Common.Models;

public sealed record StoreSettingsModel(
    string StoreName,
    string? StoreEmail,
    string? StorePhone,
    string Currency,
    string Timezone,
    int LowStockThreshold);
