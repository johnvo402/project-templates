namespace TemplateApp.Domain.Common;

public sealed class DomainException : Exception
{
    public string Code { get; }

    public DomainException(string message)
        : this("Domain.Validation", message)
    {
    }

    public DomainException(string code, string message)
        : base(message)
    {
        Code = code;
    }
}
