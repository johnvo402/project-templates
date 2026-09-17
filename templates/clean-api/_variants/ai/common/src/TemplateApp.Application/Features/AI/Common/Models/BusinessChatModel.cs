namespace TemplateApp.Application.Features.AI.Common.Models;

public sealed record BusinessChatMessageModel(string Role, string Content);

public sealed record BusinessChatHistoryState(IReadOnlyList<BusinessChatMessageModel> Messages);

public sealed record BusinessChatModel(
    string Question,
    IReadOnlyList<BusinessChatMessageModel>? History = null);
