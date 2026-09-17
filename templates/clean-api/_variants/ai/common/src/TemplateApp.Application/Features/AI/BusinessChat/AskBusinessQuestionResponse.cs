namespace TemplateApp.Application.Features.AI.BusinessChat;

public sealed record AskBusinessQuestionResponse(
    string Answer,
    string Topic,
    IReadOnlyList<string> SuggestedQuestions);
