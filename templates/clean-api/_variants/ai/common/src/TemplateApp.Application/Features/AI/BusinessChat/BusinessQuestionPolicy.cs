using TemplateApp.Application.Common.Results;
using TemplateApp.Application.Features.AI.Common.Models;

namespace TemplateApp.Application.Features.AI.BusinessChat;

public static class BusinessQuestionPolicy
{
    private static readonly string[] BlockedTerms =
    [
        "medical", "doctor", "medicine", "health diagnosis", "bệnh", "thuốc", "bác sĩ", "chẩn đoán",
        "politics", "election", "president", "chính trị", "bầu cử", "tổng thống",
        "source code", "programming", "javascript", "python", "c#", "lập trình",
        "dating", "relationship advice", "tình yêu", "hẹn hò"
    ];

    private static readonly string[] UnsupportedDataTerms =
    [
        "profit", "gross margin", "net margin", "cogs", "cost", "expense",
        "lợi nhuận", "biên lợi nhuận", "giá vốn", "chi phí",
        "forecast", "prediction", "predict", "dự báo",
        "competitor", "market share", "đối thủ", "thị phần",
        "customer lifetime", "ltv", "retention", "tỷ lệ quay lại",
        "employee performance", "staff performance", "năng suất nhân viên", "hiệu suất nhân viên",
        "tax", "legal advice", "thuế", "tư vấn pháp lý"
    ];

    private static readonly (BusinessQuestionTopic Topic, string[] Terms)[] TopicTerms =
    [
        (BusinessQuestionTopic.Revenue, ["revenue", "sales", "doanh thu", "bán hàng", "ban hang"]),
        (BusinessQuestionTopic.Orders, ["order", "orders", "pending", "processing", "completed", "cancelled", "đơn hàng", "don hang", "trạng thái đơn"]),
        (BusinessQuestionTopic.Products, ["product", "products", "best seller", "best-selling", "top product", "sản phẩm", "san pham", "bán chạy", "ban chay"]),
        (BusinessQuestionTopic.Inventory, ["inventory", "stock", "low stock", "out of stock", "tồn kho", "ton kho", "sắp hết", "sap het", "hết hàng"]),
        (BusinessQuestionTopic.Employees, ["employee", "employees", "staff count", "nhân viên", "nhan vien", "số nhân viên"]),
        (BusinessQuestionTopic.Operations, ["recent", "trend", "recommend", "recommendation", "improve", "action", "gần đây", "gan day", "xu hướng", "đề xuất", "cải thiện", "nên làm gì"]),
        (BusinessQuestionTopic.Overview, ["business", "store", "shop", "overview", "performance", "how are we doing", "kinh doanh", "cửa hàng", "cua hang", "tổng quan", "tình hình", "hoạt động"])
    ];

    private static readonly string[] FollowUpTerms =
    [
        "what about", "how about", "and today", "and yesterday", "why did", "what should",
        "còn", "con ", "thế", "the ", "vậy", "vay ", "tại sao", "tai sao", "vì sao", "vi sao", "nên làm gì", "nen lam gi"
    ];

    public static Result<BusinessQuestionTopic> Assess(
        string question,
        IReadOnlyList<BusinessChatMessageModel>? history)
    {
        var normalized = Normalize(question);

        if (ContainsAny(normalized, BlockedTerms))
            return Result<BusinessQuestionTopic>.Failure(BusinessChatErrors.OutOfScope);

        if (ContainsAny(normalized, UnsupportedDataTerms))
            return Result<BusinessQuestionTopic>.Failure(BusinessChatErrors.UnsupportedData);

        var topic = FindTopic(normalized);
        if (topic is not null)
            return Result<BusinessQuestionTopic>.Success(topic.Value);

        if (history is not null && ContainsAny(normalized, FollowUpTerms))
        {
            foreach (var message in history.Reverse())
            {
                if (!string.Equals(message.Role, "user", StringComparison.OrdinalIgnoreCase))
                    continue;

                var historyTopic = FindTopic(Normalize(message.Content));
                if (historyTopic is not null)
                    return Result<BusinessQuestionTopic>.Success(historyTopic.Value);
            }
        }

        return Result<BusinessQuestionTopic>.Failure(BusinessChatErrors.OutOfScope);
    }

    private static BusinessQuestionTopic? FindTopic(string text)
    {
        foreach (var (topic, terms) in TopicTerms)
        {
            if (ContainsAny(text, terms))
                return topic;
        }

        return null;
    }

    private static bool ContainsAny(string text, IEnumerable<string> terms)
        => terms.Any(term => text.Contains(term, StringComparison.Ordinal));

    private static string Normalize(string value)
        => value.Trim().ToLowerInvariant();
}
