namespace TemplateApp.Application.Common.Results;

public enum ErrorType
{
    Failure,
    Validation,
    NotFound,
    Conflict,
    Unauthorized,
    Forbidden,
    ServiceUnavailable
}

public sealed record Error(
    string Code,
    string Message,
    ErrorType Type = ErrorType.Failure)
{
    public static readonly Error None = new(string.Empty, string.Empty);
}
