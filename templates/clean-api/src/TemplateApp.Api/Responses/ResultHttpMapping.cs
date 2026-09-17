using Microsoft.AspNetCore.Mvc;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Api.Responses;

public static class ResultHttpMapping
{
    public static IResult ToHttpResult<T>(this Result<T> result)
        => result.Match<IResult>(
            value => Results.Ok(new ApiResponse<T>(value)),
            ToProblem);

    public static IResult ToCreatedHttpResult<T>(
        this Result<T> result,
        string location)
        => result.Match<IResult>(
            value => Results.Created(
                location,
                new ApiResponse<T>(
                    value,
                    status: StatusCodes.Status201Created)),
            ToProblem);

    public static IResult ToHttpResult(this Result result)
        => result.Match<IResult>(
            () => Results.Ok(new ApiResponse()),
            ToProblem);

    public static IResult ToNoContentHttpResult(this Result result)
        => result.Match<IResult>(
            Results.NoContent,
            ToProblem);

    public static IResult ToCreatedHttpResult(this Result result)
        => result.Match<IResult>(
            () => Results.Json(
                new ApiResponse(status: StatusCodes.Status201Created),
                statusCode: StatusCodes.Status201Created),
            ToProblem);

    private static IResult ToProblem(Error error)
    {
        var status = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.ServiceUnavailable => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status400BadRequest
        };

        return Results.Problem(new ProblemDetails
        {
            Status = status,
            Title = error.Message,
            Type = error.Code,
            Extensions =
            {
                ["errorCode"] = error.Code
            }
        });
    }
}
