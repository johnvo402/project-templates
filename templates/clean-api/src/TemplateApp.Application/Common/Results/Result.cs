namespace TemplateApp.Application.Common.Results;

public class Result
{
    protected Result(bool isSuccess, Error error)
    {
        if (isSuccess && error != Error.None)
            throw new ArgumentException("Successful result cannot contain an error.");
        if (!isSuccess && error == Error.None)
            throw new ArgumentException("Failed result must contain an error.");

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    public static Result Success() => new(true, Error.None);
    public static Result Failure(Error error) => new(false, error);

    public TReturn Match<TReturn>(
        Func<TReturn> onSuccess,
        Func<Error, TReturn> onFailure)
        => IsSuccess ? onSuccess() : onFailure(Error);
}

public sealed class Result<T> : Result
{
    private Result(T? value, bool isSuccess, Error error)
        : base(isSuccess, error)
        => Value = value;

    public T? Value { get; }

    public static Result<T> Success(T value) => new(value, true, Error.None);
    public static new Result<T> Failure(Error error) => new(default, false, error);

    public TReturn Match<TReturn>(
        Func<T, TReturn> onSuccess,
        Func<Error, TReturn> onFailure)
        => IsSuccess ? onSuccess(Value!) : onFailure(Error);
}
