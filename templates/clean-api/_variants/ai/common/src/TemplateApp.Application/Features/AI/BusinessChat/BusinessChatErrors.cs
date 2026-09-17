using TemplateApp.Application.Common.Results;

namespace TemplateApp.Application.Features.AI.BusinessChat;

public static class BusinessChatErrors
{
    public static readonly Error OutOfScope = new(
        "ai.business_chat.out_of_scope",
        "This assistant only answers questions about the store's business data and operations.",
        ErrorType.Validation);

    public static readonly Error UnsupportedData = new(
        "ai.business_chat.unsupported_data",
        "That question needs business data this starter does not currently track.",
        ErrorType.Validation);

    public static readonly Error ReadOnly = new(
        "ai.business_chat.read_only",
        "This assistant is read-only and cannot create, update, delete, or change business data.",
        ErrorType.Validation);

    public static readonly Error BusinessDataUnavailable = new(
        "ai.business_chat.data_unavailable",
        "Business data is temporarily unavailable. Please try again shortly.",
        ErrorType.ServiceUnavailable);

    public static readonly Error ProviderUnavailable = new(
        "ai.business_chat.provider_unavailable",
        "The AI provider is temporarily unavailable or not configured.",
        ErrorType.ServiceUnavailable);

    public static readonly Error EmptyResponse = new(
        "ai.business_chat.empty_response",
        "The AI provider returned an empty answer. Please try again.",
        ErrorType.ServiceUnavailable);
}
