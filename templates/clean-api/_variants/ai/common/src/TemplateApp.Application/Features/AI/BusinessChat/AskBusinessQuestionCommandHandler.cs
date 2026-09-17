using Mediator;
using TemplateApp.Application.Abstractions.AI;
using TemplateApp.Application.Abstractions.Reporting;
using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.AI.BusinessChat;

public sealed class AskBusinessQuestionCommandHandler(
    IAiService aiService,
    IBusinessReportingService reportingService)
    : ICommandHandler<AskBusinessQuestionCommand, Result<AskBusinessQuestionResponse>>
{
    public async ValueTask<Result<AskBusinessQuestionResponse>> Handle(
        AskBusinessQuestionCommand command,
        CancellationToken cancellationToken)
    {
        var assessment = BusinessQuestionPolicy.Assess(command.Model.Question, command.Model.History);
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

        var prompt = BusinessChatPromptBuilder.Build(command.Model, topic, dashboard);
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

        return Result<AskBusinessQuestionResponse>.Success(new AskBusinessQuestionResponse(
            answer.Trim(),
            topic.ToString(),
            GetSuggestions(topic)));
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
