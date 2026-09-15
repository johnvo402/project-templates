using TemplateApp.Domain.Common;

namespace TemplateApp.Domain.Todos;

public sealed class TodoTitle : ValueObject
{
    public const int MaxLength = 300;

    private TodoTitle(string value) => Value = value;

    public string Value { get; }

    public static TodoTitle Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new DomainException("Todos.TitleRequired", "Todo title is required.");

        var normalized = value.Trim();
        if (normalized.Length > MaxLength)
            throw new DomainException("Todos.TitleTooLong", $"Todo title cannot exceed {MaxLength} characters.");

        return new TodoTitle(normalized);
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
