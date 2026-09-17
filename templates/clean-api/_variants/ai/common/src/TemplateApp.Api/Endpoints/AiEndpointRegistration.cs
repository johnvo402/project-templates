using System.Security.Claims;
using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.AI.BusinessChat;
using TemplateApp.Application.Features.AI.Common.Models;
using TemplateApp.Application.Features.AI.GenerateText;

namespace TemplateApp.Api.Endpoints;

public static class AiEndpointRegistration
{
    public static IEndpointRouteBuilder MapOptionalAiEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/ai/business-chat/history", async (
                ClaimsPrincipal principal,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetUserId(principal, out var userId))
                    return InvalidSubject();

                var result = await sender.Send(new GetBusinessChatHistoryQuery(userId), cancellationToken);
                return result.ToHttpResult();
            })
            .WithTags("AI")
            .RequireAuthorization(AppPolicies.AiGenerate);

        app.MapPost("/api/ai/business-chat", async (
                BusinessChatModel model,
                ClaimsPrincipal principal,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetUserId(principal, out var userId))
                    return InvalidSubject();

                var result = await sender.Send(new AskBusinessQuestionCommand(model, userId), cancellationToken);
                return result.ToHttpResult();
            })
            .WithTags("AI")
            .RequireAuthorization(AppPolicies.AiGenerate);

        app.MapPost("/api/ai/generate", async (
                AiPromptModel model,
                ISender sender,
                CancellationToken cancellationToken) =>
            {
                var result = await sender.Send(new GenerateAiTextCommand(model), cancellationToken);
                return result.ToHttpResult();
            })
            .WithTags("AI")
            .RequireAuthorization(AppPolicies.AiGenerate);

        return app;
    }

    private static bool TryGetUserId(ClaimsPrincipal principal, out Guid userId)
        => Guid.TryParse(principal.FindFirstValue("sub"), out userId);

    private static IResult InvalidSubject()
        => Result<object>.Failure(new Error(
            "auth.invalid_subject",
            "Authenticated subject is invalid.",
            ErrorType.Unauthorized)).ToHttpResult();
}
