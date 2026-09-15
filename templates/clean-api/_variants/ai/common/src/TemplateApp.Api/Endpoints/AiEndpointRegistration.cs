using Mediator;
using TemplateApp.Api.Authentication;
using TemplateApp.Api.Responses;
using TemplateApp.Application.Features.AI.Common.Models;
using TemplateApp.Application.Features.AI.GenerateText;

namespace TemplateApp.Api.Endpoints;

public static class AiEndpointRegistration
{
    public static IEndpointRouteBuilder MapOptionalAiEndpoints(this IEndpointRouteBuilder app)
    {
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
}
