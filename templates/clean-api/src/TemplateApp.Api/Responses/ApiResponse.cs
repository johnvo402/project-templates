namespace TemplateApp.Api.Responses;

public class ApiBaseResponse
{
    public int Status { get; init; }
    public string? Message { get; init; }
}

public sealed class ApiResponse<T> : ApiBaseResponse
{
    public T? Results { get; init; }

    public ApiResponse(
        T? results,
        string message = "Success",
        int status = StatusCodes.Status200OK)
    {
        Results = results;
        Status = status;
        Message = message;
    }
}

public sealed class ApiResponse : ApiBaseResponse
{
    public ApiResponse(
        string message = "Success",
        int status = StatusCodes.Status200OK)
    {
        Status = status;
        Message = message;
    }
}
