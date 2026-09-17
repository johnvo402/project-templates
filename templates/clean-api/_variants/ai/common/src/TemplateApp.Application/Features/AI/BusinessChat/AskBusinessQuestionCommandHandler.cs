using Mediator;
using TemplateApp.Application.Abstractions.AI;
using TemplateApp.Application.Abstractions.Persistence;
using TemplateApp.Application.Abstractions.Reporting;
using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.BusinessChat;

public sealed class AskBusinessQuestionCommandHandler(
    IAiService aiService,
    IBusinessReportingService reportingService,
    IUnitOfWork? unitOfWork = null)
    : ICommandHandler<AskBusinessQuestionCommand, Result<AskBusinessQuestionResponse>>
{
    private const int MaxStoredMessages = 40;

    public async ValueTask<Result<AskBusinessQuestionResponse>> Handle(
        AskBusinessQuestionCommand command,
        CancellationToken cancellationToken)
    {
        var history = await LoadHistoryAsync(command.UserId, command.Model.History, cancellationToken);
        var model = command.Model with { History = history };

        var assessment = BusinessQuestionPolicy.Assess(model.Question, model.History);
        if (assessment.IsFailure)
            return Result<AskBusinessQuestionResponse>.Failure(assessment.Error);

        var topic = assessment.Value!;

        TemplateApp.Application.Features.Dashboard.Common.Projections.DashboardProjection dashboard;
        try
        {
            dashboard = await reportingService.GetDashboardAsync(cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch
        {
            return Result<AskBusinessQuestionResponse>.Failure(BusinessChatErrors.BusinessDataUnavailable);
        }

        var prompt = BusinessChatPromptBuilder.Build(model, topic, dashboard);
        string answer;
        try
        {
            answer = await aiService.GenerateTextAsync(prompt, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch
        {
            return Result<AskBusinessQuestionResponse>.Failure(BusinessChatErrors.ProviderUnavailable);
        }

        if (string.IsNullOrWhiteSpace(answer))
            return Result<AskBusinessQuestionResponse>.Failure(BusinessChatErrors.EmptyResponse);

        var trimmedAnswer = answer.Trim();
        await SaveHistoryAsync(command.UserId, history, model.Question.Trim(), trimmedAnswer, cancellationToken);

        return Result<AskBusinessQuestionResponse>.Success(new AskBusinessQuestionResponse(
            trimmedAnswer,
            topic.ToString(),
            GetSuggestions(topic)));
    }

    private async Task<IReadOnlyList<BusinessChatMessageModel>> LoadHistoryAsync(
        Guid? userId,
        IReadOnlyList<BusinessChatMessageModel>? fallback,
        CancellationToken cancellationToken)
    {
//#if (redis)
        if (userId is not null && unitOfWork is not null)
        {
            try
            {
                var cached = await unitOfWork
                    .CacheRepository<BusinessChatHistoryState>()
                    .GetAsync(GetHistoryKey(userId.Value), cancellationToken);

                if (cached?.Messages is { Count: > 0 })
                    return cached.Messages;
            }
            catch
            {
                // Chat stays available when Redis is temporarily unavailable.
            }
        }
//#endif

        return fallback ?? [];
    }

    private async Task SaveHistoryAsync(
        Guid? userId,
        IReadOnlyList<BusinessChatMessageModel> history,
        string question,
        string answer,
        CancellationToken cancellationToken)
    {
//#if (redis)
        if (userId is null || unitOfWork is null)
            return;

        try
        {
            var messages = history
                .Append(new BusinessChatMessageModel("user", question))
                .Append(new BusinessChatMessageModel("assistant", answer))
                .TakeLast(MaxStoredMessages)
                .ToArray();

            await unitOfWork
                .CacheRepository<BusinessChatHistoryState>()
                .SetAsync(
                    GetHistoryKey(userId.Value),
                    new BusinessChatHistoryState(messages),
                    GetTimeUntilNextUtcMidnight(),
                    cancellationToken);
        }
        catch
        {
            // History persistence must not turn a successful AI answer into a failed request.
        }
//#endif
    }

    private static string GetHistoryKey(Guid userId)
        => $"ai:business-chat:{userId:N}:{DateTime.UtcNow:yyyyMMdd}";

    private static TimeSpan GetTimeUntilNextUtcMidnight()
    {
        var now = DateTimeOffset.UtcNow;
        var nextMidnight = new DateTimeOffset(now.UtcDateTime.Date.AddDays(1), TimeSpan.Zero);
        return nextMidnight - now;
    }

    private static IReadOnlyList<string> GetSuggestions(BusinessQuestionTopic topic)
        => topic switch
        {
            BusinessQuestionTopic.Revenue => [
                "How is revenue trending in the available period?",
                "Which products contribute the most revenue?",
                "What operational actions should I consider from these sales numbers?"
            ],
            BusinessQuestionTopic.Orders => [
                "How many orders are still pending?",
                "What does the current order-status mix look like?",
                "Do recent orders show any operational issue I should watch?"
            ],
            BusinessQuestionTopic.Products => [
                "Which products are selling best?",
                "Which top products generate the most revenue?",
                "What should I prioritize based on current product performance?"
            ],
            BusinessQuestionTopic.Inventory => [
                "How many products are low on stock?",
                "What inventory risk should I pay attention to?",
                "What should I check before restocking?"
            ],
            BusinessQuestionTopic.Employees => [
                "How many employees are currently represented in the store data?",
                "What operational workload signals can be inferred from orders?",
                "What staffing questions cannot be answered with the current data?"
            ],
            _ => [
                "Summarize the current business situation.",
                "What should I pay attention to today?",
                "Which products and order statuses stand out?"
            ]
        };
}

public sealed class GetBusinessChatHistoryQueryHandler(IUnitOfWork unitOfWork)
    : IQueryHandler<GetBusinessChatHistoryQuery, Result<IReadOnlyList<BusinessChatMessageModel>>>
{
    public async ValueTask<Result<IReadOnlyList<BusinessChatMessageModel>>> Handle(
        GetBusinessChatHistoryQuery query,
        CancellationToken cancellationToken)
    {
//#if (redis)
        try
        {
            var history = await unitOfWork
                .CacheRepository<BusinessChatHistoryState>()
                .GetAsync($"ai:business-chat:{query.UserId:N}:{DateTime.UtcNow:yyyyMMdd}", cancellationToken);

            return Result<IReadOnlyList<BusinessChatMessageModel>>.Success(history?.Messages ?? []);
        }
        catch
        {
            return Result<IReadOnlyList<BusinessChatMessageModel>>.Success([]);
        }
//#else
        await Task.CompletedTask;
        return Result<IReadOnlyList<BusinessChatMessageModel>>.Success([]);
//#endif
    }
}
