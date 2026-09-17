namespace TemplateApp.Application.Common.Exceptions;

public sealed class PersistenceConcurrencyException(Exception innerException)
    : Exception("The resource was modified by another request. Reload and retry.", innerException)
{
    public const string ErrorCode = "Persistence.ConcurrencyConflict";
}
