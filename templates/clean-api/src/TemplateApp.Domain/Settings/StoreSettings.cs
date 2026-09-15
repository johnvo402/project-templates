using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Settings;

public sealed class StoreSettings : AggregateRoot<StoreSettingsId>
{
    private StoreSettings() : base(StoreSettingsId.Default) { }

    private StoreSettings(StoreSettingsId id) : base(id) { }

    public string StoreName { get; private set; } = "Template Store";
    public string? StoreEmail { get; private set; }
    public string? StorePhone { get; private set; }
    public string Currency { get; private set; } = "VND";
    public string Timezone { get; private set; } = "Asia/Ho_Chi_Minh";
    public int LowStockThreshold { get; private set; } = 5;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public static StoreSettings CreateDefault() => new(StoreSettingsId.Default);

    public void Update(
        string storeName,
        string? storeEmail,
        string? storePhone,
        string currency,
        string timezone,
        int lowStockThreshold)
    {
        if (string.IsNullOrWhiteSpace(storeName)) throw new DomainException("Store name is required.");
        if (string.IsNullOrWhiteSpace(currency)) throw new DomainException("Currency is required.");
        if (string.IsNullOrWhiteSpace(timezone)) throw new DomainException("Timezone is required.");
        if (lowStockThreshold < 0) throw new DomainException("Low stock threshold cannot be negative.");

        StoreName = storeName.Trim();
        StoreEmail = string.IsNullOrWhiteSpace(storeEmail) ? null : storeEmail.Trim();
        StorePhone = string.IsNullOrWhiteSpace(storePhone) ? null : storePhone.Trim();
        Currency = currency.Trim().ToUpperInvariant();
        Timezone = timezone.Trim();
        LowStockThreshold = lowStockThreshold;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
